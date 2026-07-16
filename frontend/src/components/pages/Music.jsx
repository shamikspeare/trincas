import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';

import grid1 from '../../assets/musicgrid1.png';
import grid2 from '../../assets/musicgrid2.png';
import grid3 from '../../assets/musicgrid3.png';
import grid4 from '../../assets/musicgrid4.png';
import grid5 from '../../assets/musicgrid5.png';
import grid6 from '../../assets/musicgrid6.png';
import originsImg from '../../assets/music-origins.png';
import weekdaysImg from '../../assets/music-weekdays.png';

const images = [grid1, grid2, grid3, grid4, grid5, grid6];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* Small ornamental divider below headings */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center mt-3 gap-1.5 opacity-50">
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#ffffff' }} />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2 C10 5, 14 6, 14 8 C14 10, 10 11, 8 14 C6 11, 2 10, 2 8 C2 6, 6 5, 8 2Z"
        fill="#ffffff"
      />
    </svg>
    <div className="w-8 h-[1px]" style={{ backgroundColor: '#ffffff' }} />
  </div>
);

const extraButtons = [
  { img: originsImg, heading: 'History of Music at Trincas', link: '/music-origins' },
  { img: weekdaysImg, heading: 'One Crazy Music Chart!', link: '/music-weekdays' },
];

const Music = () => {
  return (
    <main className="w-full bg-black min-h-screen flex flex-col text-white">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music' }]} />

      {/* Section title */}
      <div className="w-full flex justify-center pt-10 pb-2 px-4">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          Full Music Schedule
        </h2>
      </div>

      {/* Bento grid */}
      <motion.div
        className="w-full px-3 pt-6 pb-12"
        style={{ maxWidth: 480, margin: '0 auto' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          {images.map((src, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="overflow-hidden hover:opacity-90 transition-opacity rounded-2xl"
              style={{ aspectRatio: '1 / 1' }}
            >
              <Link to={`/musicgrid${index + 1}`} className="block w-full h-full">
                <img
                  src={src}
                  alt={`Music ${index + 1}`}
                  className="w-full h-full object-cover block"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="w-full pb-8">
        <OrnamentalDivider />
      </div>

      {/* Extra image buttons below the grid */}
      <div className="w-full flex flex-col pb-12">
        {extraButtons.map(({ img, heading, link }, index) => (
          <motion.section
            key={heading}
            className="w-full"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Link
              to={link}
              className="mx-auto flex flex-col items-center hover:opacity-90 transition-opacity"
              style={{ maxWidth: 600, padding: '0.25rem 1.25rem 1.5rem 1.25rem' }}
            >
              <div className="w-full" style={{ maxWidth: 520 }}>
                <img
                  src={img}
                  alt={heading}
                  className="w-full h-auto block rounded-2xl"
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
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                }}
              >
                {heading}
              </h2>

              <OrnamentalDivider />
            </Link>
          </motion.section>
        ))}
      </div>
    </main>
  );
};

export default Music;
