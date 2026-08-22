import React from 'react';
import { motion } from 'framer-motion';
import ScrollCircle from './ScrollCircle';
import Breadcrumb from './Breadcrumb';

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

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const HistoryTimeline = () => {
  return (
    <main className="w-full bg-white min-h-[60vh]">
      <div className="pointer-events-none w-full">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'History' }]} />
      </div>
      <div className="w-full">
        <ScrollCircle />
      </div>
    </main>
  );
};

export default HistoryTimeline;