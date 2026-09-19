import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import { supabase } from '../../lib/supabase';

const Press = () => {
  const [pressItems, setPressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchPressItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('press_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('published_date', { ascending: false });
        
      if (!error && data) {
        setPressItems(data);
      } else {
        console.error('Failed to fetch press items:', error);
      }
      setLoading(false);
    };

    fetchPressItems();
  }, []);

  const openModal = (index) => {
    setSelectedItemIndex(index);
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setSelectedItemIndex(null), 300);
  };

  useEffect(() => {
    if (selectedItemIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (selectedItemIndex === null) return;
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedItemIndex]);

  const selectedItem = selectedItemIndex !== null ? pressItems[selectedItemIndex] : null;

  return (
    <main className="w-full bg-white min-h-screen grid">
      {selectedItemIndex === null && (
        <div className="col-start-1 row-start-1 w-full z-40 pointer-events-none">
          <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Press' }]} />
        </div>
      )}

      <div className="col-start-1 row-start-1 w-full pb-6 pt-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-[10px] mb-8 text-center">
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            PRESS
          </h1>
          <p className="mt-2 text-xs text-gray-600 mx-8 italic">
            A curated archive of media features, editorial highlights, and press coverage.
            Documenting our work and milestones as published across global outlets.
          </p>
        </div>

        {/* Gallery */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 min-h-[40vh]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="text-sm text-gray-400">loading...</span>
            </div>
          ) : pressItems.length === 0 ? (
            <div className="text-center text-sm text-gray-500 mt-10">
              No press items available yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {pressItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer bg-gray-100 shadow-sm group"
                  onClick={() => openModal(index)}
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title || `Press coverage ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Dark blur overlay — bottom portion only, for text legibility */}
                  <div
                    className="pointer-events-none absolute inset-0 backdrop-blur-xl bg-black/60"
                    style={{
                      maskImage:
                        'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0) 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,0.9) 22%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0) 100%)',
                    }}
                  />

                  {/* White gradient at the very bottom edge, fading to transparent */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
                    style={{
                      background: 'linear-gradient(to top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%)',
                    }}
                  />

                  {/* Text Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10 pointer-events-none">
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-80 mb-1 line-clamp-1">
                      {item.publication}
                    </p>
                    <h3 className="text-sm font-medium leading-snug line-clamp-3 drop-shadow-md">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal – mobile only (though this style works on desktop too) */}
        {selectedItemIndex !== null && selectedItem && (
          <div
            className={`fixed inset-0 z-50 flex flex-col items-center pt-[74px] pb-6 px-4 bg-black/90 backdrop-blur-md transition-opacity duration-300 overflow-y-auto ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeModal}
          >
            {/* Top Left Close Button - offset below navbar */}
            <div className="w-full flex justify-start sticky top-0 z-10">
              <button
                onClick={closeModal}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white backdrop-blur-sm shadow-md hover:bg-white/30 active:scale-95 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Centered Content */}
            <div
              className="flex flex-col items-center w-full max-w-4xl mx-auto mt-4 pb-12"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.image_url && (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  loading="lazy"
                  decoding="async"
                  className={`w-full max-w-[92vw] md:max-w-2xl h-auto rounded-lg shadow-2xl object-contain transition-all duration-300 ${
                    isAnimating
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                />
              )}

              <div className={`mt-6 text-center text-white w-full px-4 transition-all duration-500 delay-100 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {selectedItem.publication && (
                  <p className="text-xs uppercase tracking-widest text-white/70 font-semibold mb-2">
                    {selectedItem.publication}
                  </p>
                )}
                
                <h2 className="text-xl md:text-2xl font-serif leading-tight">
                  {selectedItem.title}
                </h2>
                
                {selectedItem.published_date && (
                  <p className="mt-2 text-sm text-white/50">
                    {new Date(selectedItem.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                
                {selectedItem.link && (
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Press;