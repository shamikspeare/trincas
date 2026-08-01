import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import prideKolkataImg from '../../assets/pride-kolkata.png';
import prideLgbtqImg from '../../assets/pride-lgbtq.png';
import Breadcrumb from '../Breadcrumb';


const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.12,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

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

const PrideCard = ({ img, heading, link, index, description, disabled = false }) => {
  const CardTag = link ? Link : 'button';

  return (
    
    <motion.div
    
      className="w-full"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <CardTag
        {...(link ? { to: link } : { type: 'button', disabled })}
        className={`mx-auto flex w-full max-w-2xl flex-col items-center transition-opacity ${
          disabled ? 'cursor-default' : 'hover:opacity-90'
        }`}
        style={{ padding: index === 0 ? '1.5rem 1.25rem' : '0.25rem 1.25rem 1.5rem 1.25rem' }}
      >
        <div className="w-full">
          <img
            src={img}
            alt={heading}
            className="w-full h-auto block rounded-[24px]"
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
            letterSpacing: '0.02em',
            backgroundImage:
              'linear-gradient(90deg, ' +
              '#FF0018 0%, ' +
              '#FFA52C 16.6%, ' +
              '#FFFF41 33.3%, ' +
              '#008026 50%, ' +
              '#004DFF 66.6%, ' +
              '#750787 83.3%, ' +
              '#FF0018 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          {heading}
        </h2>

        {description ? (
          <p className="mt-2 max-w-xl text-center text-sm leading-6 text-gray-600 sm:text-base">
            {description}
          </p>
        ) : null}

        <OrnamentalDivider />
      </CardTag>
    </motion.div>
  );
};

export default function Pride() {
  return (
    <main
      className="w-full pt-12 pb-8"
      style={{
        background:
          'linear-gradient(135deg, ' +
          'rgba(255, 0, 24, 0.18) 0%, ' +
          'rgba(255, 165, 44, 0.18) 16.6%, ' +
          'rgba(255, 239, 0, 0.18) 33.3%, ' +
          'rgba(0, 128, 38, 0.18) 50%, ' +
          'rgba(0, 77, 255, 0.18) 66.6%, ' +
          'rgba(117, 7, 135, 0.18) 83.3%, ' +
          'rgba(255, 0, 24, 0.18) 100%)',
      }}
    >
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Pride' }]} />

      <div className="w-full flex flex-col">
        <PrideCard
          img={prideLgbtqImg}
          heading="LGBTQ"
          link="/pride-lgbtq"
          index={1}
          description="Explore stories, resources, and community-driven highlights."
        />
        <PrideCard
          img={prideKolkataImg}
          heading="Pride of Kolkata"
          index={0}
          description="A tribute to the city, its culture, and the people who shaped our story."
          disabled
        />
      </div>
    </main>
  );
}