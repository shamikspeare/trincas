import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Breadcrumb from '../Breadcrumb';

import weekdaysImg from '../../assets/music-weekdays.png';
import weekendsImg from '../../assets/music-weekends.png';
import starsImg from '../../assets/music-stars-of-trincas.png';
import originsImg from '../../assets/music-origins.png';

const frames = [
  { img: weekdaysImg, heading: 'Weekdays', compact: false, link: '/music/weekdays' },
  { img: weekendsImg, heading: 'Weekends', compact: false, link: '/music/weekends' },
  { img: starsImg, heading: 'Stars of Trincas', compact: false, link: '/music/stars-of-trincas', objectPosition: 'top' },
  { img: originsImg, heading: 'Origins', compact: false, link: '/music/origins' },
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

const FrameCard = ({ img, heading, compact, index, link, objectPosition }) => (
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
          className={`w-full ${compact ? 'object-contain' : 'object-cover rounded-2xl'}`}
          style={{ aspectRatio: '16 / 10', objectPosition: objectPosition || 'center' }}
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

const Music = () => {
  return (
    <main className="w-full bg-[#fbfaf9] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music' }]} />
      <div className="w-full flex flex-col pt-6 pb-12">
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

export default Music;
