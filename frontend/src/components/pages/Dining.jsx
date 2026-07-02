import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../Breadcrumb';

import trincasImg from '../../assets/trincas-home.jpeg';
import otherRoomImg from '../../assets/other room-home.jpeg';
import mingImg from '../../assets/ming-home.jpeg';
import tavernImg from '../../assets/tavern-home.jpeg';
import mingHeaderImg from '../../assets/ming-header.png';
import trincasLogoImg from '../../assets/logo.png';
import tavernHeaderImg from '../../assets/tavern-header.png';

const frames = [
  {
    img: trincasImg,
    heading: 'Trincas',
    titleImg: trincasLogoImg,
    titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' },
    compact: false
  },
  {
    img: otherRoomImg,
    heading: 'THE OTHER ROOM',
    headingStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 'bold',
      color: 'black'
    },
    compact: false
  },
  {
    img: mingImg,
    heading: 'Ming Room',
    titleImg: mingHeaderImg,
    titleImgStyle: { height: 'clamp(5rem, 16vw, 8rem)' },
    compact: true
  },
  {
    img: tavernImg,
    heading: 'Tavern',
    titleImg: tavernHeaderImg,
    titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' },
    compact: true
  },
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

const FrameCard = ({ img, heading, headingStyle, titleImg, titleImgStyle, compact, index }) => (
  <motion.section
    className="w-full"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: 600, padding: index === 0 ? '1.5rem 1.25rem' : '0.25rem 1.25rem 1.5rem 1.25rem' }}>
      <div className="w-full" style={{ maxWidth: compact ? 460 : 520 }}>
        <img
          src={img}
          alt={heading}
          className="w-full object-cover rounded-2xl"
          style={{ aspectRatio: '16 / 10' }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {titleImg ? (
        <img
          src={titleImg}
          alt={heading}
          className="mt-3 sm:mt-4 mx-auto object-contain relative"
          style={{
            zIndex: 0,
            ...(titleImgStyle || { height: 'clamp(5rem, 14vw, 7rem)' })
          }}
        />
      ) : (
        <h2
          className="mt-3 sm:mt-4 text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 500,
            color: '#3D2B1F',
            letterSpacing: '0.02em',
            ...headingStyle
          }}
        >
          {heading}
        </h2>
      )}

      <OrnamentalDivider />
    </div>
  </motion.section>
);

const Dining = () => {
  return (
    <main className="w-full bg-[#fff7ed] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Dining Spaces' }]} />
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

export default Dining;
