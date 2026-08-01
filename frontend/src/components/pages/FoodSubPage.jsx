import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Expand, X } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import indianMenuImg from '../../assets/menu-indian.png';
import chineseMenuImg from '../../assets/menu-chinese.png';
import continentalMenuImg from '../../assets/menu-continental.png';
import cafeMenuImg from '../../assets/menu-cafe.png';
import foodIndianImg from '../../assets/food-indian.jpg';
import foodChineseImg from '../../assets/food-chinese.jpg';
import foodContinentalImg from '../../assets/food-continental.jpg';
import foodCafeImg from '../../assets/food-cafe.jpg';
import foodDrinksImg from '../../assets/food-drinks.png';
import foodImg from '../../assets/food.jpeg';
import diningImg from '../../assets/dining.jpeg';
import historyImg from '../../assets/history.jpeg';
import trincasHomeImg from '../../assets/trincas-home.jpeg';

const menuImages = {
  Indian: indianMenuImg,
  Chinese: chineseMenuImg,
  Continental: continentalMenuImg,
  Cafe: cafeMenuImg,
  Drinks: foodDrinksImg,
};

const featuredDishes = {
  Indian: [
    { title: 'Paneer Irani Tikka', price: '₹315', image: foodIndianImg },
    { title: 'Chicken Irani Kebab', price: '₹315', image: foodImg },
    { title: 'Sizzling Chelo Kebab', price: '₹525', image: diningImg },
    { title: 'Mughlai Platter', price: '₹445', image: trincasHomeImg },
  ],
  Chinese: [
    { title: 'Szechuan Paneer', price: '₹295', image: foodChineseImg },
    { title: 'Crispy Chilli Potatoes', price: '₹245', image: foodImg },
    { title: 'Dragon Noodles', price: '₹325', image: historyImg },
    { title: 'Hunan Veg Bowl', price: '₹365', image: diningImg },
  ],
  Continental: [
    { title: 'Herb Roasted Platter', price: '₹425', image: foodContinentalImg },
    { title: 'Creamy Pasta Toss', price: '₹345', image: foodImg },
    { title: 'Grilled House Special', price: '₹395', image: trincasHomeImg },
    { title: 'Rustic Steak Plate', price: '₹525', image: diningImg },
  ],
  Drinks: [
    { title: 'Citrus Cooler', price: '₹185', image: foodDrinksImg },
    { title: 'Classic Mojito', price: '₹195', image: foodImg },
    { title: 'Cold Brew Float', price: '₹225', image: historyImg },
    { title: 'Signature Spritz', price: '₹245', image: trincasHomeImg },
  ],
  Cafe: [
    { title: 'Cafe Supreme Sandwich', price: '₹275', image: foodCafeImg },
    { title: 'Loaded Fries Basket', price: '₹225', image: foodImg },
    { title: 'Baked Brie Toast', price: '₹295', image: diningImg },
    { title: 'Affogato Platter', price: '₹245', image: historyImg },
  ],
};

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const SectionHeading = ({ title, subtitle }) => (
  <div className="text-center">
    <div className="flex items-center gap-3 justify-center">
      <span className="h-px w-8 bg-[#caa56a] opacity-70" />
      <h2 className="font-serif text-[clamp(1.8rem,6vw,3rem)] leading-none text-[#1e1e1e]">
        {title}
      </h2>
      <span className="h-px w-8 bg-[#caa56a] opacity-70" />
    </div>
    {subtitle ? (
      <p className="mt-2 text-sm sm:text-base text-[#7d6c59]">{subtitle}</p>
    ) : null}
  </div>
);

const FeaturedCard = ({ dish }) => (
  <motion.article
    variants={cardVariants}
    className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23%]"
  >
    <div className="h-full overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-[0_10px_30px_rgba(23,15,7,0.08)]">
      <div className="relative">
        <img
          src={dish.image}
          alt={dish.title}
          className="h-44 sm:h-48 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute left-3 top-3 rounded-full bg-[#b47d22] px-3 py-1 text-[11px] font-medium text-white shadow-sm">
          Popular
        </div>
      </div>

      <div className="p-4 text-center">
        <h3 className="font-serif text-lg text-[#1d1d1d]">{dish.title}</h3>
        <p className="mt-1 text-[clamp(1rem,3vw,1.1rem)] font-medium text-[#b47d22]">
          {dish.price}
        </p>
      </div>
    </div>
  </motion.article>
);

const storyImages = {
  Indian: foodIndianImg,
  Chinese: foodChineseImg,
  Continental: foodContinentalImg,
  Drinks: foodDrinksImg,
  Cafe: foodCafeImg,
};

const FoodSubPage = ({ title }) => {
  const [selectedMenuOpen, setSelectedMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuImage = menuImages[title] || cafeMenuImg;
  const dishes = featuredDishes[title] || featuredDishes.Cafe;

  const openModal = () => {
    setSelectedMenuOpen(true);
    requestAnimationFrame(() => {
      setIsAnimating(true);
    });
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => setSelectedMenuOpen(false), 300);
  };

  useEffect(() => {
    if (selectedMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (!selectedMenuOpen) return;
      if (e.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMenuOpen]);

  return (
    <main className="min-h-[60vh] bg-[#fbf8f3]">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Food & Beverages', link: '/food' }, { label: title }]} />

      <motion.div
        className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={cardVariants} className="mt-2">
          <div className="rounded-[28px] border border-[#eadfce] bg-white p-3 shadow-[0_12px_30px_rgba(23,15,7,0.07)] sm:p-4">
            <button
              type="button"
              onClick={openModal}
              className="group relative block w-full overflow-hidden rounded-[22px] text-left"
              aria-label={`Expand ${title} menu`}
            >
              <img
                src={menuImage}
                alt={`${title} menu`}
                className="h-auto w-full object-cover"
                loading="eager"
                decoding="async"
              />

              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-4 py-2 text-sm font-bold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform group-active:scale-95">
                  <Expand className="h-4 w-4" />
                  <span>Expand</span>
              </span>
              </span>
            </button>
          </div>
        </motion.section>

        <motion.section variants={cardVariants} className="mt-10 sm:mt-12">
          <SectionHeading title="Featured Dishes" subtitle="Guest favourites" />

          <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="flex gap-4 snap-x snap-mandatory">
              {dishes.map((dish, index) => (
                <FeaturedCard key={`${title}-${dish.title}-${index}`} dish={dish} index={index} />
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section variants={cardVariants} className="mt-10 sm:mt-12">
          <div className="rounded-[28px] border border-[#eadfce] bg-white p-4 shadow-[0_12px_30px_rgba(23,15,7,0.07)] sm:p-5">
            <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:items-start">
              <div className="px-1 py-1 sm:px-2">
                <h2 className="font-serif text-[clamp(2rem,7vw,3.2rem)] leading-none text-[#1e1e1e]">
                  Our Story
                </h2>
                <div className="mt-4 overflow-hidden rounded-[22px] bg-[#f1ece4]">
                  <img
                    src={storyImages[title] || foodCafeImg}
                    alt={`${title} story`}
                    className="h-64 w-full object-cover sm:h-72 md:h-full"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-[#4f453b] sm:text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                  labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                  voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {selectedMenuOpen ? (
        <div
          className={`fixed inset-0 z-50 flex flex-col justify-between items-center pt-[74px] pb-6 px-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeModal}
        >
          <div className="w-full flex justify-start">
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md active:scale-95 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>

          <div
            className="flex flex-col items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={menuImage}
              alt={`${title} menu expanded`}
              loading="eager"
              decoding="async"
              className={`max-w-[92vw] max-h-[78vh] w-auto h-auto object-contain rounded-[20px] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 ${
                isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
};

export default FoodSubPage;
