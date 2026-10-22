// src/pages/FoodSubPage.jsx
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, ImageOff, RefreshCw, X } from "lucide-react";
import Breadcrumb from "../Breadcrumb";
import InstagramReelCarousel from "../InstagramReelCarousel";
import { fetchPageLayout, getFoodPageKey } from "../../lib/pageLayouts";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const SectionHeading = ({ title, subtitle }) => (
  <div className="text-center">
    <div className="flex items-center gap-3 justify-center">
      <span className="h-px w-8 bg-gray-300" />
      <h2 className="font-serif text-[clamp(1.8rem,6vw,3rem)] leading-none text-gray-900">
        {title}
      </h2>
      <span className="h-px w-8 bg-gray-300" />
    </div>
    {subtitle ? <p className="mt-2 text-sm sm:text-base text-gray-500">{subtitle}</p> : null}
  </div>
);

// Card: image + CMS dish name below it. The name is stored in alt_text so it
// remains useful as both the image's accessible name and visible caption.
const FeaturedCard = ({ card }) => {
  const altText = card.alt_text || card.title || card.name || "";
  return (
    <motion.article
      variants={cardVariants}
      className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23%]"
    >
      <div className="h-full overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
        <div className="relative">
          <img
            src={card.image_url || card.src}
            alt={altText}
            className="h-44 sm:h-48 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-serif text-lg text-gray-900">{altText}</h3>
        </div>
      </div>
    </motion.article>
  );
};

const PageLoading = () => (
  <main className="min-h-[60vh] bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-gray-400">
      <p className="text-sm">loading...</p>
    </div>
  </main>
);

const PageError = ({ title, onRetry }) => (
  <main className="min-h-[60vh] bg-white flex items-center justify-center px-4">
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="text-gray-600">Couldn't load the {title} page right now.</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  </main>
);

const EmptyDishes = () => (
  <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-gray-200 bg-white/60 py-12 text-center text-gray-500">
    <ImageOff className="h-6 w-6 opacity-60" />
    <p className="text-sm">No featured dishes have been added yet.</p>
  </div>
);

export default function FoodSubPage({ slug: propSlug, title, basePath }) {
  const { slug: routeSlug } = useParams();
  const slug = propSlug ?? routeSlug ?? (basePath ? basePath.replace("/food-", "") : undefined);
  const displayTitle = title || (slug ? `${slug.charAt(0).toUpperCase()}${slug.slice(1)}` : "Food");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenuOpen, setSelectedMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      setData(await fetchPageLayout(getFoodPageKey(slug)));
    } catch (err) {
      setError(err.message || "Failed to load page");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const openMenu = () => {
    setSelectedMenuOpen(true);
    requestAnimationFrame(() => setIsAnimating(true));
  };

  const closeMenu = () => {
    setIsAnimating(false);
    window.setTimeout(() => setSelectedMenuOpen(false), 300);
  };

  useEffect(() => {
    document.body.style.overflow = selectedMenuOpen ? "hidden" : "";

    const handleKeyDown = (event) => {
      if (selectedMenuOpen && event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMenuOpen]);

  if (loading) return <PageLoading />;
  if (error) return <PageError title={displayTitle} onRetry={load} />;

  const menuImages = data?.menuImages?.length
    ? data.menuImages
    : data?.layout?.lead_image_url
      ? [data.layout.lead_image_url]
      : [];
  const previewMenuImage = menuImages[0] || null;
  const cards = data?.imageCards || [];

  return (
    <main className="min-h-[60vh] bg-white">
      <Breadcrumb
        items={[
          { label: "Home", link: "/" },
          { label: "Food & Beverages", link: "/food" },
          { label: displayTitle },
        ]}
      />

      <motion.div
        className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.section variants={cardVariants} className="mt-2 w-full">
          {previewMenuImage ? (
            <button
              type="button"
              onClick={openMenu}
              className="group relative block w-full overflow-hidden rounded-lg text-left"
              aria-label={`Expand ${displayTitle} menu`}
            >
              <img
                src={previewMenuImage}
                alt={`${displayTitle} menu cover`}
                className="h-auto w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-5 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform group-active:scale-95">
                  <Expand className="h-4 w-4" />
                  <span>Expand</span>
                </span>
              </span>
            </button>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-white text-gray-500">
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

          {cards.length === 0 ? (
            <EmptyDishes />
          ) : (
            <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              <div className="flex gap-4 snap-x snap-mandatory">
                {cards.map((card) => (
                  <FeaturedCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <InstagramReelCarousel videos={data?.instagramVideos || []} title="On Instagram" />
      </motion.div>

      <AnimatePresence>
        {selectedMenuOpen && previewMenuImage ? (
          <div
            className={`fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`${displayTitle} menu`}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-start p-4 pt-[74px]">
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 shadow-md transition hover:bg-white/20 active:scale-95"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div
              className="flex w-full flex-1 flex-col items-center overflow-y-auto px-4 pb-10 pt-[120px]"
              onClick={closeMenu}
              role="presentation"
            >
              <div
                className={`flex w-full max-w-5xl flex-col items-center justify-start gap-4 transition-all duration-300 ${
                  isAnimating ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
                }`}
                onClick={(event) => event.stopPropagation()}
                role="presentation"
              >
                {menuImages.map((imageUrl, index) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={imageUrl}
                    alt={`${displayTitle} menu page ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-auto w-full rounded object-contain shadow-2xl"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
