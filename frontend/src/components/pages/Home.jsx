import React from 'react';

import diningImg from '../../assets/dining.png';
import foodImg from '../../assets/food.png';
import musicImg from '../../assets/music.png';
import historyImg from '../../assets/history.png';

const frames = [
  { img: diningImg,  heading: 'Dining Spaces',   compact: false, bg: 'rgba(246, 229, 205)' },
  { img: foodImg,    heading: 'Food & Beverages', compact: false, bg: 'rgba(249, 233, 210)' },
  { img: musicImg,   heading: 'Music',            compact: true,  bg: 'rgba(239, 222, 197)' },
  { img: historyImg, heading: 'History',          compact: true,  bg: 'rgba(244, 229, 207)' },
];

/* Small ornamental divider below headings */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center mt-3 gap-1.5 opacity-50">
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#3D2B1F' }} />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2 C10 5, 14 6, 14 8 C14 10, 10 11, 8 14 C6 11, 2 10, 2 8 C2 6, 6 5, 8 2Z"
        fill="#3D2B1F"
      />
    </svg>
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#3D2B1F' }} />
  </div>
);

const FrameCard = ({ img, heading, compact, currentBg, prevBg }) => (
  <section 
    className="w-full" 
    style={{ 
      background: `linear-gradient(to bottom, ${prevBg} 0%, ${currentBg} 15%, ${currentBg} 100%)` 
    }}
  >
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 600, padding: '1.5rem 1.25rem' }}>
      <div className="w-full" style={{ maxWidth: compact ? 460 : 520 }}>
        <img
          src={img}
          alt={heading}
          className={`w-full ${compact ? 'object-contain' : 'object-cover rounded-2xl'}`}
          style={{ aspectRatio: '16 / 10' }}
          loading="lazy"
          decoding="async"
        />
      </div>

    <h2
      className="mt-3 sm:mt-4 text-center"
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: 500,
        color: '#3D2B1F',
        letterSpacing: '0.02em',
      }}
    >
      {heading}
    </h2>

    <OrnamentalDivider />
    </div>
  </section>
);

const Home = () => {
  const pageBg = 'rgba(239, 222, 197)';
  return (
    <main
      className="w-full"
      style={{ backgroundColor: pageBg }}
    >
      <div className="w-full flex flex-col">
        {frames.map((frame, index) => {
          const prevBg = index === 0 ? pageBg : frames[index - 1].bg;
          return (
            <FrameCard 
              key={frame.heading} 
              {...frame} 
              prevBg={prevBg} 
              currentBg={frame.bg} 
            />
          );
        })}
      </div>
    </main>
  );
};

export default Home;
