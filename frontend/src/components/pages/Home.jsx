import React from 'react';

import diningImg from '../../assets/dining.png';
import foodImg from '../../assets/food.png';
import musicImg from '../../assets/music.png';
import historyImg from '../../assets/history.png';

const frames = [
  { img: diningImg, heading: 'Dining Spaces' },
  { img: foodImg, heading: 'Food & Beverages' },
  { img: musicImg, heading: 'Music' },
  { img: historyImg, heading: 'History' },
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

const FrameCard = ({ img, heading }) => (
  <div className="w-full flex flex-col items-center">
    <div className="w-full" style={{ maxWidth: 520 }}>
      <img
        src={img}
        alt={heading}
        className="w-full object-cover rounded-2xl"
        style={{ aspectRatio: '16 / 10' }}
        loading="lazy"
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
);

const Home = () => {
  return (
    <main
      className="w-full"
      style={{ backgroundColor: 'rgba(249, 233, 209, 1)' }}
    >
      <div
        className="mx-auto flex flex-col items-center gap-2 sm:gap-4"
        style={{ maxWidth: 600, padding: '1rem 1rem 1.5rem' }}
      >
        {frames.map((frame) => (
          <FrameCard key={frame.heading} {...frame} />
        ))}
      </div>
    </main>
  );
};

export default Home;
