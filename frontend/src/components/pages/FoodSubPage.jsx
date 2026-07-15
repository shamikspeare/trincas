import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Breadcrumb from '../Breadcrumb';
import indianMenuImg from '../../assets/indian-menu.png';

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

const TextButton = ({ heading, isImage, src, alt, index, link }) => (
  <motion.section
    className="w-full mb-12 flex justify-center"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    {isImage ? (
      <Link to={link} className="block w-full hover:opacity-80 transition-opacity">
        <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
      </Link>
    ) : (
      <Link to={link} className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity bg-[#333333] rounded-xl p-8 shadow-sm" style={{ width: '100%', maxWidth: 400 }}>
        <h2
          className="text-center m-0 p-0"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '0.02em',
          }}
        >
          {heading}
        </h2>
      </Link>
    )}
  </motion.section>
);

const FoodSubPage = ({ title, basePath }) => {
  const buttons = [
    ...(title === 'Indian' 
      ? [{ isImage: true, src: indianMenuImg, alt: 'Indian Menu', link: `${basePath}/menu` }]
      : [{ heading: 'Menu', link: `${basePath}/menu` }]
    ),
    { heading: title === 'Drinks' ? 'Most Loved Drinks' : 'Most Loved Dishes', link: `${basePath}/most-loved` },
    { heading: 'History', link: `${basePath}/history` },
  ];

  return (
    <main className="w-full bg-[#fbfaf9] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Food & Beverages', link: '/food' }, { label: title }]} />
      <div className="w-full flex flex-col pt-12 pb-16 flex-1 px-0">
        {buttons.map((btn, index) => (
          <TextButton
            key={btn.heading}
            index={index}
            {...btn}
          />
        ))}
      </div>
    </main>
  );
};

export default FoodSubPage;
