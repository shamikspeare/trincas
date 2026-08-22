import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Breadcrumb from '../Breadcrumb';
import historyTimelineImg from '../../assets/history-timeline.png';

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

const OrnamentalDivider = () => (
  <div className="mt-3 flex items-center justify-center gap-1.5 opacity-50">
    <div className="h-[1px] w-8 bg-black" />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2 C10 5, 14 6, 14 8 C14 10, 10 11, 8 14 C6 11, 2 10, 2 8 C2 6, 6 5, 8 2Z"
        fill="#000000"
      />
    </svg>
    <div className="h-[1px] w-8 bg-black" />
  </div>
);

const History = () => {
  return (
    <main className="w-full bg-white min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'History' }]} />

      <div className="w-full flex flex-col pt-6 pb-12">
        <motion.section
          className="w-full"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Link
            to="/history-timeline"
            className="mx-auto flex flex-col items-center transition-opacity hover:opacity-90"
            style={{ maxWidth: 600, padding: '1.5rem 1.25rem' }}
          >
            <div className="w-full max-w-[520px]">
              <img
                src={historyTimelineImg}
                alt="History Timeline of Trincas"
                className="block h-auto w-full rounded-3xl"
                loading="lazy"
                decoding="async"
              />
            </div>

            <h2
              className="mt-3 text-center text-black font-medium tracking-[0.02em] sm:mt-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2rem, 5vw, 3rem)',
              }}
            >
              History Timeline of Trincas
            </h2>

            <OrnamentalDivider />
          </Link>
        </motion.section>
      </div>
    </main>
  );
};

export default History;