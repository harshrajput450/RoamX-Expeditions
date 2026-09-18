import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Trip } from '../types';

interface GallerySectionProps {
  trip: Trip;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ trip }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = [trip.heroImage, ...trip.gallery.filter((img) => img !== trip.heroImage)];

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % allImages.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length);
    }
  };

  return (
    <section id="gallery-section" className="py-12 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Visual Journey</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Photos from the Trail
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Captured by our trek leaders and adventurous travelers on recent batches.
          </p>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {allImages.slice(0, 8).map((imgUrl, index) => (
            <div
              key={index}
              onClick={() => setLightboxIndex(index)}
              className={`relative rounded-xl overflow-hidden group cursor-pointer shadow-xs border border-gray-200 aspect-4/3 ${
                index === 0 ? 'sm:col-span-2 sm:row-span-2 aspect-auto sm:h-full min-h-[240px]' : ''
              }`}
            >
              <img
                src={imgUrl}
                alt={`${trip.title} Trail Photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>View Full Photo</span>
                </span>
              </div>

              {index === 0 && (
                <span className="absolute top-3 left-3 bg-[#004E64] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  Cover Photo
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
              <img
                src={allImages[lightboxIndex]}
                alt="Enlarged trail photo"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
              <div className="text-center mt-3 text-white text-xs font-semibold">
                Photo {lightboxIndex + 1} of {allImages.length} • {trip.title}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
