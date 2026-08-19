import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import { supabase } from '../../lib/supabase';

import mingHeaderImg from '../../assets/ming-header.png';
import trincasLogoImg from '../../assets/logo.png';
import tavernHeaderImg from '../../assets/tavern-header.png';

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

/* Maps a slug to its custom heading/logo metadata (kept local — transparent PNGs) */
function getDiningMetadata(slug, name) {
  switch (slug) {
    case 'trincas':
      return {
        titleImg: trincasLogoImg,
        titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' },
        compact: false
      };
    case 'the-other-room':
      return {
        heading: 'THE OTHER ROOM',
        headingStyle: {
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 'bold',
          color: 'black'
        },
        compact: false
      };
    case 'ming-room':
      return {
        titleImg: mingHeaderImg,
        titleImgStyle: { height: 'clamp(5rem, 16vw, 8rem)' },
        compact: true
      };
    case 'tavern':
      return {
        titleImg: tavernHeaderImg,
        titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' },
        compact: true
      };
    default:
      return {
        heading: name,
        compact: false
      };
  }
}

const FrameCard = ({ slug, image_url, name, headingStyle, titleImg, titleImgStyle, compact, index }) => (
  <motion.section
    className="w-full"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariants}
  >
    <Link
      to={`/dining/${slug}`}
      className="mx-auto flex flex-col items-center"
      style={{ maxWidth: 600, padding: index === 0 ? '1.5rem 1.25rem' : '0.25rem 1.25rem 1.5rem 1.25rem' }}
    >
      <div className="w-full" style={{ maxWidth: compact ? 460 : 520 }}>
        <img
          src={image_url}
          alt={name}
          className="w-full object-cover rounded-2xl"
          style={{ aspectRatio: '16 / 10' }}
          loading="lazy"
          decoding="async"
        />
      </div>

      {titleImg ? (
        <img
          src={titleImg}
          alt={name}
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
          {name}
        </h2>
      )}

      <OrnamentalDivider />
    </Link>
  </motion.section>
);

const Dining = () => {
  const [diningSpaces, setDiningSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDiningSpaces = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('dining')
        .select('*')
        .order('display_order', { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const merged = (data || []).map((row) => ({
        ...row,
        ...getDiningMetadata(row.slug, row.name)
      }));

      setDiningSpaces(merged);
      setLoading(false);
    };

    fetchDiningSpaces();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="w-full bg-white min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Dining Spaces' }]} />

      {loading && (
        <div className="w-full flex justify-center items-center py-20 text-[#3D2B1F]">
          Loading dining spaces...
        </div>
      )}

      {!loading && error && (
        <div className="w-full flex justify-center items-center py-20 text-red-600">
          Unable to load dining spaces. Please try again later.
        </div>
      )}

      {!loading && !error && (
        <div className="w-full flex flex-col pt-6 pb-12">
          {diningSpaces.map((frame, index) => (
            <FrameCard key={frame.id ?? frame.slug} index={index} {...frame} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Dining;