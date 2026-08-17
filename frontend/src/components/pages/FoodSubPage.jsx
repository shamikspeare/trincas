// src/pages/FoodSubPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, X, ImageOff, RefreshCw } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import { supabase } from '../../lib/supabase';

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

// Dish card: only image + name — food_dishes has no price/description column.
const FeaturedCard = ({ dish }) => (
  <motion.article
    variants={cardVariants}
    className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23%]"
  >
    <div className="h-full overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-[0_10px_30px_rgba(23,15,7,0.08)]">
      <div className="relative">
        <img
          src={dish.image_url}
          alt={dish.name}
          className="h-44 sm:h-48 w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="font-serif text-lg text-[#1d1d1d]">{dish.name}</h3>
      </div>
    </div>
  </motion.article>
);

/* ---------- Loading / Error / Empty states ---------- */

const PageLoading = ({ title }) => (
  <main className="min-h-[60vh] bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-[#7d6c59]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#eadfce] border-t-[#b47d22]" />
      <p className="text-sm">Loading {title}…</p>
    </div>
  </main>
);

const PageError = ({ title, onRetry }) => (
  <main className="min-h-[60vh] bg-white flex items-center justify-center px-4">
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-[#7d6c59]">Couldn't load the {title} page right now.</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-medium text-[#1e1e1e] shadow-sm hover:bg-[#fbf8f3]"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  </main>
);

const EmptyDishes = () => (
  <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-[#eadfce] bg-white/60 py-12 text-center text-[#7d6c59]">
    <ImageOff className="h-6 w-6 opacity-60" />
    <p className="text-sm">No featured dishes have been added yet.</p>
  </div>
);

/* ---------- Single fetch helper — selects only real columns ---------- */

async function fetchFoodPageData(slug) {
  const [{ data: page, error: pageError }, { data: dishes, error: dishesError }] = await Promise.all([
    supabase
      .from('food_pages')
      .select('id, slug, menu_image_url')
      .eq('slug', slug)
      .maybeSingle(),
    supabase
      .from('food_dishes')
      .select('id, slug, name, image_url, display_order')
      .eq('slug', slug)
      .order('display_order', { ascending: true }),
  ]);

  if (pageError) throw pageError;
  if (dishesError) throw dishesError;

  return { page: page || null, dishes: dishes || [] };
}

/* ---------- Main component (public page — read only) ---------- */

// `slug` drives every Supabase query (e.g. "indian"); `title` is just display text.
const FoodSubPage = ({ slug: propSlug, title, basePath }) => {
  const { slug: routeSlug } = useParams();
  const slug = propSlug ?? routeSlug ?? (basePath ? basePath.replace('/food-', '') : undefined);

  const displayTitle = title || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '');

  const [page, setPage] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMenuOpen, setSelectedMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const load = useCallback(async () => {
    if (!slug) {
      setPage(null);
      setDishes([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { page: pageData, dishes: dishData } = await fetchFoodPageData(slug);
      setPage(pageData);
      setDishes(dishData || []);
    } catch (err) {
      setError(err.message || 'Failed to load page');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = () => {
    setSelectedMenuOpen(true);
    requestAnimationFrame(() => setIsAnimating(true));
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

  if (loading) return <PageLoading title={displayTitle} />;
  if (error) return <PageError title={displayTitle} onRetry={load} />;

  const menuImage = page?.menu_image_url || null;

  return (
    <main className="min-h-[60vh] bg-white">
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Food & Beverages', link: '/food' },
          { label: displayTitle },
        ]}
      />

      <motion.div
        className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Menu image */}
        <motion.section variants={cardVariants} className="mt-2 w-full">
          {menuImage ? (
            <button
              type="button"
              onClick={openModal}
              className="group relative block w-full text-left"
              aria-label={`Expand ${displayTitle} menu`}
            >
              <img
                src={menuImage}
                alt={`${displayTitle} menu`}
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
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-white text-[#7d6c59]">
              <div className="flex flex-col items-center gap-2 text-sm">
                <ImageOff className="h-6 w-6 opacity-60" />
                Menu image coming soon
              </div>
            </div>
          )}
        </motion.section>

        {/* Featured dishes */}
        <motion.section variants={cardVariants} className="mt-10 sm:mt-12">
          <SectionHeading title="Featured Dishes" subtitle="Guest favourites" />

          {dishes.length === 0 ? (
            <EmptyDishes />
          ) : (
            <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              <div className="flex gap-4 snap-x snap-mandatory">
                {dishes.map((dish) => (
                  <FeaturedCard key={dish.id} dish={dish} />
                ))}
              </div>
            </div>
          )}
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {selectedMenuOpen && menuImage ? (
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
                alt={`${displayTitle} menu expanded`}
                loading="eager"
                decoding="async"
                className={`max-w-[95vw] max-h-[85vh] w-auto h-auto object-contain transition-all duration-300 ${
                  isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              />
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
};

export default FoodSubPage;