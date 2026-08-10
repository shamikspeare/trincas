import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import pressImage1 from '../../assets/press/press-image1.png';
import pressImage2 from '../../assets/press/press-image2.png';
import pressImage3 from '../../assets/press/press-image3.png';
import pressImage4 from '../../assets/press/press-image4.png';
import pressImage5 from '../../assets/press/press-image5.png';
import pressImage6 from '../../assets/press/press-image6.png';
import pressImage7 from '../../assets/press/press-image7.png';
import pressImage8 from '../../assets/press/press-image8.png';
import pressImage9 from '../../assets/press/press-image9.png';
import pressImage10 from '../../assets/press/press-image10.png';
import pressImage11 from '../../assets/press/press-image11.png';
import pressImage12 from '../../assets/press/press-image12.png';
import pressImage13 from '../../assets/press/press-image13.png';
import pressImage14 from '../../assets/press/press-image14.png';
import pressImage15 from '../../assets/press/press-image15.png';
import pressImage16 from '../../assets/press/press-image16.png';
import pressImage17 from '../../assets/press/press-image17.png';
import pressImage18 from '../../assets/press/press-image18.png';
import pressImage19 from '../../assets/press/press-image19.png';

const pressImages = [
  pressImage1, pressImage2, pressImage3, pressImage4, pressImage5,
  pressImage6, pressImage7, pressImage8, pressImage9, pressImage10,
  pressImage11, pressImage12, pressImage13, pressImage14, pressImage15,
  pressImage16, pressImage17, pressImage18, pressImage19
];

const Press = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const openModal = (index) => {
    setSelectedImageIndex(index);
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setSelectedImageIndex(null), 300);
  };

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex]);

  return (
    <main className="w-full bg-white min-h-screen grid">
      {selectedImageIndex === null && (
        <div className="col-start-1 row-start-1 w-full z-50 pointer-events-none">
          <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Press' }]} />
        </div>
      )}

      <div className="col-start-1 row-start-1 w-full pb-6 pt-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto mt-[10px] mb-8 text-center">
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            PRESS
          </h1>
          <p className="mt-2 text-xs text-gray-600 mx-8 italic">A curated archive of media features, editorial highlights, and press coverage.
Documenting our work and milestones as published across global outlets.</p>
        </div>

        {/* Gallery – 2 columns, larger gap */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-4 px-4">
          {pressImages.map((src, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer bg-gray-100"
              onClick={() => openModal(index)}
            >
              <img
                src={src}
                alt={`Press coverage ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Smooth blur+darken overlay: flush to bottom/left/right edges, strongest at bottom, fades to nothing at top with no hard edge */}
              <div
                className="pointer-events-none absolute inset-0 backdrop-blur-xl bg-black/60"
                style={{
                  maskImage:
                    'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage:
                    'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0) 100%)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Modal – mobile only */}
        {selectedImageIndex !== null && (
          <div
            className={`fixed inset-0 z-50 flex flex-col justify-between items-center pt-[74px] pb-6 px-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          >
            {/* Top Left Close Button - offset below navbar */}
            <div className="w-full flex justify-start">
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md active:scale-95 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>

            {/* Centered Image + Hint */}
            <div
              className="flex flex-col items-center justify-center my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={pressImages[selectedImageIndex]}
                alt={`Press coverage ${selectedImageIndex + 1}`}
                loading="lazy"
                decoding="async"
                className={`max-w-[92vw] max-h-[70vh] w-auto h-auto object-contain transition-all duration-300 ${
                  isAnimating
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              />

              {/* Hint text */}
              <p className="mt-3 text-[10px] leading-none text-white/80 tracking-wide">
                pinch to zoom in/out
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Press;