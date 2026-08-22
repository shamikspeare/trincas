import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import Footer from '../Footer';

// Swapped the schedule image out for the stars image
import scheduleImg from '../../assets/music-stars-of-trincas.png';
import originsImg from '../../assets/music-origins.png';
import weekdaysImg from '../../assets/music-weekdays.png';

// Clean, simple line divider
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center mt-6 mb-2 opacity-50">
    <div className="w-16 h-[1px]" style={{ backgroundColor: '#000000' }} />
  </div>
);

const Music = () => {
  // Menu linking to your separate pages - reduced to 3 buttons
  const menuButtons = [
    { img: scheduleImg, heading: 'Trincas Music Schedule', link: '/music-schedule' },
    { img: originsImg, heading: 'Tavern Behind Trincas', link: '/music-origins' },
    { img: weekdaysImg, heading: 'Music Legacy: All the Artists from 1959 till now.', link: '/music-weekdays' },
  ];

  return (
    <main className="w-full bg-white min-h-screen flex flex-col text-gray-900">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music' }]} />

      <div className="w-full flex justify-center pt-10 pb-8 px-4">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            fontWeight: 500,
            color: '#000000',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          Music at Trincas
        </h2>
      </div>

      {/* Renders all buttons stacked dynamically */}
      <div className="w-full flex flex-col pb-16">
        {menuButtons.map(({ img, heading, link }, index) => (
          <section key={heading} className="w-full flex flex-col items-center">
            <div
              className="mx-auto flex flex-col items-center w-full"
              style={{ maxWidth: 600, padding: '0.5rem 1.25rem 1.5rem 1.25rem' }}
            >
              <motion.div
                className="w-full transition-transform duration-300 rounded-2xl overflow-hidden bg-white"
                style={{ maxWidth: 520 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link to={link} className="block group w-full h-full">
                  <img
                    src={img}
                    alt={heading}
                    className="w-full h-auto block group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-4 text-center select-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)',
                  fontWeight: 500,
                  color: '#000000',
                  letterSpacing: '0.02em',
                }}
              >
                <Link to={link} className="hover:text-gray-700 transition-colors">
                  {heading}
                </Link>
              </motion.h2>

              {/* Only show the divider if it's not the last item in the list */}
              {index !== menuButtons.length - 1 && <OrnamentalDivider />}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
};

export default Music;