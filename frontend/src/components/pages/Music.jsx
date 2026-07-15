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

const Music = () => {
  return (
    <main className="w-full bg-[#fbfaf9] min-h-screen flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music' }]} />

      <motion.div
        className="w-full px-3 pt-12 pb-12"
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
              className="overflow-hidden hover:opacity-90 transition-opacity"
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
    </main>
  );
};

export default Music;
