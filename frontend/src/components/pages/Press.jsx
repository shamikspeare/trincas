import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const goToPrevious = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === 0 ? pressImages.length - 1 : prev - 1
    );
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === pressImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToIndex = (e, index) => {
    e.stopPropagation();
    setSelectedImageIndex(index);
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

      if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) =>
          prev === 0 ? pressImages.length - 1 : prev - 1
        );
      }

      if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) =>
          prev === pressImages.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex]);

  return (
    <main className="w-full bg-black min-h-screen grid">
      {selectedImageIndex === null && (
        <div className="col-start-1 row-start-1 w-full z-50 pointer-events-none">
          <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Press' }]} />
        </div>
      )}

      <div className="col-start-1 row-start-1 w-full px-1.5 pb-6 pt-24 sm:px-6 sm:pt-32 sm:pb-12 md:pt-36 md:pb-24 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mt-[10px] mb-8 sm:mb-12 md:mb-16 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-wide text-gray-100">
            PRESS
          </h1>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto grid grid-cols-3 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-5 md:gap-6 lg:gap-8">
          {pressImages.map((src, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer group bg-gray-50"
              onClick={() => openModal(index)}
            >
              <img
                src={src}
                alt={`Press coverage ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedImageIndex !== null && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          >
            {/* Image + Dots — no stopPropagation on this wrapper itself,
                so clicks on its empty padding/gaps fall through and close the modal */}
            <div className="flex flex-col items-center px-6 sm:px-12">
              <img
                src={pressImages[selectedImageIndex]}
                alt={`Press coverage ${selectedImageIndex + 1}`}
                loading="lazy"
                decoding="async"
                onClick={(e) => e.stopPropagation()}
                className={`max-w-[90vw] max-h-[72vh] sm:max-w-[80vw] sm:max-h-[78vh] lg:max-w-[70vw] object-contain transition-all duration-300 ${
                  isAnimating
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95'
                }`}
              />

              {/* Navigation */}
              <div className="flex items-center justify-center gap-5 mt-6">
                {/* Previous */}
                <button
                  onClick={goToPrevious}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:scale-105 transition"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 text-black" />
                </button>

                {/* Sliding Dots */}
                <div className="flex items-center gap-2 min-w-[56px] justify-center">
                  {(() => {
                    let start = Math.max(0, selectedImageIndex - 1);

                    if (start + 3 > pressImages.length) {
                      start = pressImages.length - 3;
                    }

                    start = Math.max(0, start);

                    return pressImages
                      .slice(start, start + 3)
                      .map((_, localIndex) => {
                        const index = start + localIndex;

                        return (
                          <button
                            key={index}
                            onClick={(e) => goToIndex(e, index)}
                            aria-label={`Go to image ${index + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                              index === selectedImageIndex
                                ? 'w-6 h-2 bg-white'
                                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        );
                      });
                  })()}
                </div>

                {/* Next */}
                <button
                  onClick={goToNext}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg hover:scale-105 transition"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Press;