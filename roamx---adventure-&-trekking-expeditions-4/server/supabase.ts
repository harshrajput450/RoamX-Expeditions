import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable resolution
const supabaseUrl = process.env.SUPABASE_URL || '';
// Prefer service role key for server operations to bypass RLS, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export const BUCKET_NAME = 'roamx-media';

/**
 * Get or initialize the Supabase client safely.
 * Returns null if credentials are not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  if (supabaseUrl && supabaseKey) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase Client initialized successfully with URL:', supabaseUrl);
    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err);
      supabaseClient = null;
    }
  } else {
    // Helpful log when running without Supabase configuration
    // (fallback mode will be used)
  }

  return supabaseClient;
}

/**
 * Determines whether a string is a base64 data URI (e.g. data:image/png;base64,...)
 */
export function isBase64DataUrl(str: string): boolean {
  return typeof str === 'string' && str.startsWith('data:image/');
}

/**
 * Uploads a base64 string or image buffer to Supabase Storage bucket.
 * Returns the public CDN URL if successful, or the original string on fallback.
 */
export async function uploadImageToStorage(
  base64OrUrl: string,
  folder: 'trips' | 'reviews' | 'avatars' = 'trips'
): Promise<string> {
  // If it's already a regular http/https URL, return it as-is
  if (!isBase64DataUrl(base64OrUrl)) {
    return base64OrUrl;
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. Retaining image data without cloud upload.');
    return base64OrUrl;
  }

  try {
    // Parse the data URI (e.g. "data:image/jpeg;base64,/9j/4AAQSkZJRg...")
    const matches = base64OrUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64OrUrl;
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
      ? 'webp'
      : contentType.includes('gif')
      ? 'gif'
      : 'jpg';

    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    // Upload to Supabase Storage bucket
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error(`❌ Error uploading to Supabase Storage bucket "${BUCKET_NAME}":`, error.message);
      return base64OrUrl;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
    console.log(`✅ Uploaded image to Supabase Storage: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('❌ Exception during Supabase Storage upload:', err);
    return base64OrUrl;
  }
}

/**
 * Deletes a file from Supabase Storage if it belongs to the roamx-media bucket.
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== 'string') return false;

  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // Check if the URL belongs to Supabase Storage roamx-media bucket
    // e.g. https://<project>.supabase.co/storage/v1/object/public/roamx-media/trips/123.jpg
    const bucketMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;
    const markerIndex = imageUrl.indexOf(bucketMarker);
    if (markerIndex === -1) {
      return false; // Not hosted on our Supabase bucket
    }

    const filePath = imageUrl.substring(markerIndex + bucketMarker.length);
    if (!filePath) return false;

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.error(`❌ Error deleting file "${filePath}" from Supabase Storage:`, error.message);
      return false;
    }

    console.log(`🗑️ Deleted file "${filePath}" from Supabase Storage`);
    return true;
  } catch (err) {
    console.error('❌ Exception during Supabase Storage file deletion:', err);
    return false;
  }
}
