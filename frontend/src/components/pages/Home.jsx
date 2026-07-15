import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import diningImg from '../../assets/dining.jpeg';
import foodImg from '../../assets/food.jpeg';
import musicImg from '../../assets/music.jpeg';
import historyImg from '../../assets/history.jpeg';
import pressImg from '../../assets/home-press.jpeg';

const frames = [
  { img: diningImg, heading: 'Dining Spaces', compact: false, bg: 'rgba(246, 229, 205)', link: '/dining' },
  { img: foodImg, heading: 'Food & Beverages', compact: false, bg: 'rgba(249, 233, 210)', link: '/food' },
  { img: musicImg, heading: 'Music', compact: false, bg: 'rgba(239, 222, 197)', link: '/music' },
  { img: historyImg, heading: 'History', compact: false, bg: 'rgba(244, 229, 207)', link: '/history' },
  { img: pressImg, heading: 'Press', compact: false, link: '/press' },
];

/* Small ornamental divider below headings */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center mt-3 gap-1.5 opacity-50">
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#000000' }} />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2 C10 5, 14 6, 14 8 C14 10, 10 11, 8 14 C6 11, 2 10, 2 8 C2 6, 6 5, 8 2Z"
        fill="#000000"
      />
    </svg>
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#000000' }} />
  </div>
);

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const FrameCard = ({ img, heading, compact, index, link }) => (
  <motion.section
    className="w-full"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <Link to={link} className="mx-auto flex flex-col items-center hover:opacity-90 transition-opacity" style={{ maxWidth: 600, padding: index === 0 ? '1.5rem 1.25rem' : '0.25rem 1.25rem 1.5rem 1.25rem' }}>
      <div className="w-full" style={{ maxWidth: compact ? 460 : 520 }}>
        <img
          src={img}
          alt={heading}
          className="w-full h-auto block"
          loading="lazy"
          decoding="async"
        />
      </div>

      <h2
        className="mt-3 sm:mt-4 text-center"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 500,
          color: '#000000',
          letterSpacing: '0.02em',
        }}
      >
        {heading}
      </h2>

      <OrnamentalDivider />
    </Link>
  </motion.section>
);

const Home = () => {
  return (
    <main className="w-full bg-[#fbfaf9] pt-12">
      <div className="w-full flex flex-col">
        {frames.map((frame, index) => (
          <FrameCard
            key={frame.heading}
            index={index}
            {...frame}
          />
        ))}
      </div>
    </main>
  );
};

export default Home;
