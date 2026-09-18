import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance: Razorpay | null = null;

/**
 * Returns the public Razorpay Key ID safe for client-side checkout.
 */
export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
}

/**
 * Returns the private Razorpay Secret Key (SERVER ONLY - NEVER EXPOSE TO FRONTEND).
 */
export function getRazorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET || '';
}

/**
 * Lazy initialization of Razorpay Node SDK.
 */
export function getRazorpayClient(): Razorpay | null {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (!keyId || !keySecret) {
    return null;
  }

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (err) {
      console.error('❌ Failed to initialize Razorpay SDK:', err);
      return null;
    }
  }

  return razorpayInstance;
}

export interface CreateOrderParams {
  amountInPaise: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  isMock?: boolean;
}

/**
 * Creates a server-side order using the Razorpay API.
 */
export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<RazorpayOrderResult> {
  const client = getRazorpayClient();
  const currency = params.currency || 'INR';
  const receipt = params.receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  if (client) {
    try {
      const order = await client.orders.create({
        amount: params.amountInPaise,
        currency,
        receipt,
        notes: params.notes || {},
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || receipt,
        isMock: false,
      };
    } catch (error: any) {
      console.error('❌ Razorpay Orders API error:', error);
      throw new Error(error?.error?.description || error?.message || 'Failed to create Razorpay order');
    }
  }

  // Graceful fallback for local development if keys are not yet configured in Settings
  console.warn(
    '⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment. Using sandbox simulation mode for developer testing.'
  );

  const mockOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  return {
    id: mockOrderId,
    amount: params.amountInPaise,
    currency,
    receipt,
    isMock: true,
  };
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Verifies Razorpay payment signature via HMAC-SHA256.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
 */
export function verifyRazorpayPaymentSignature(params: VerifySignatureParams): boolean {
  const { orderId, paymentId, signature } = params;
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const secret = getRazorpayKeySecret();

  // If secret is set, do cryptographic HMAC verification
  if (secret) {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Use timingSafeEqual to prevent timing attacks
      const generatedBuffer = Buffer.from(generatedSignature, 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (generatedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
    } catch (err) {
      console.error('❌ Error verifying signature with crypto:', err);
      return false;
    }
  }

  // If simulated dev order without keys
  if (orderId.startsWith('order_sim_') || paymentId.startsWith('pay_sim_')) {
    return true;
  }

  return false;
}
