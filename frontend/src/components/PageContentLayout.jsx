import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, ImageOff, X } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import InstagramReelCarousel from "./InstagramReelCarousel";
import { sanitizeHtml } from "../lib/sanitize";

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function SectionHeading({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-center justify-center gap-3 text-center">
      <span className="h-px w-8 bg-gray-300" />
      <h2 className="font-serif text-[clamp(1.8rem,6vw,3rem)] leading-none text-gray-900">{children}</h2>
      <span className="h-px w-8 bg-gray-300" />
    </div>
  );
}

function MenuStyleLeadImage({ src, alt, emptyText }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return undefined;

    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  return (
    <motion.section variants={sectionVariants} className="mt-2 flex w-full justify-center">
      {src ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block w-full max-w-sm overflow-hidden rounded-lg text-left shadow-[0_20px_55px_rgba(15,23,42,0.28)] transition-shadow duration-300 hover:shadow-[0_24px_65px_rgba(15,23,42,0.36)]"
          aria-label={`Expand ${alt}`}
        >
          <img
            src={src}
            alt={alt}
            className="h-auto w-full object-contain"
            loading="eager"
            decoding="async"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-5 py-2.5 text-sm font-bold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform group-active:scale-95">
              <Expand className="h-4 w-4" aria-hidden="true" />
              <span>Expand</span>
            </span>
          </span>
        </button>
      ) : (
        <div className="flex aspect-[9/16] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 px-6 text-center text-gray-500">
          <p className="text-sm sm:text-base">{emptyText}</p>
        </div>
      )}

      <AnimatePresence>
        {expanded && src ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-start p-4 pt-[74px]">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 shadow-md transition hover:bg-white/20 active:scale-95"
                aria-label={`Close ${alt}`}
              >
                <X className="h-5 w-5 text-white" aria-hidden="true" />
              </button>
            </div>

            <div
              className="flex min-h-0 w-full flex-1 items-center justify-center overflow-auto px-4 pb-8 pt-[116px]"
              onClick={() => setExpanded(false)}
              role="presentation"
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.94, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 18 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                src={src}
                alt={alt}
                className="h-full max-h-full w-auto max-w-full rounded object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function ImageCarousel({ cards, title }) {
  if (!cards.length) return null;
  return (
    <motion.section variants={sectionVariants} className="mt-10 sm:mt-12">
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-4 snap-x snap-mandatory">
          {cards.map((card) => (
            <article key={card.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23%]">
              <div className="h-full overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.alt_text || ""}
                    className="aspect-[4/3] h-auto w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-gray-400">
                    <ImageOff className="h-6 w-6 opacity-60" />
                  </div>
                )}
                <div className="p-4 text-center">
                  <h3 className="font-serif text-lg text-gray-900">{card.alt_text || ""}</h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
export default function PageContentLayout({
  breadcrumbs,
  layout,
  imageCards = [],
  instagramVideos = [],
  imageCardsTitle = "Highlights",
  instagramTitle = "On Instagram",
  embedded = false,
  backgroundClass = "bg-white",
  textColorClass = "text-[#514638]",
  menuStyleLeadImage = false,
  leadImageAlt = "Page hero image",
  leadImageEmptyText = "Add hero image to show here",
}) {
  const sanitizedBody = sanitizeHtml(layout?.body || "");

  const hasContent = Boolean(
    layout?.heading ||
    layout?.lead_image_url ||
    menuStyleLeadImage ||
    sanitizedBody ||
    imageCards.length > 0 ||
    instagramVideos.length > 0
  );

  const Wrapper = embedded ? "div" : "main";

  return (
    <Wrapper className={backgroundClass}>
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}
      {hasContent ? (
        <motion.div
          className={`mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8 ${menuStyleLeadImage ? "pb-16" : "pb-8"}`}
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {layout?.heading ? (
            <motion.header variants={sectionVariants} className="mx-auto max-w-4xl text-center">
              <h1 className="font-serif text-[clamp(2.3rem,7vw,4.5rem)] leading-none text-[#1e1e1e]">{layout.heading}</h1>
            </motion.header>
          ) : null}

          {menuStyleLeadImage ? (
            <MenuStyleLeadImage
              src={layout?.lead_image_url}
              alt={leadImageAlt}
              emptyText={leadImageEmptyText}
            />
          ) : layout?.lead_image_url ? (
              <motion.section variants={sectionVariants} className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-[22px]">
                <img src={layout.lead_image_url} alt={leadImageAlt} className="h-auto w-full object-cover" loading="eager" decoding="async" />
              </motion.section>
          ) : null}

          {sanitizedBody ? (
            <motion.section
              variants={sectionVariants}
              className={`mx-auto mt-6 max-w-4xl space-y-4 text-base leading-relaxed ${textColorClass} sm:text-lg [&_a]:text-indigo-600 [&_a]:underline`}
              dangerouslySetInnerHTML={{ __html: sanitizedBody }}
            />
          ) : null}

          <ImageCarousel cards={imageCards} title={imageCardsTitle} />
          <InstagramReelCarousel videos={instagramVideos} title={instagramTitle} />
        </motion.div>
      ) : null}
    </Wrapper>
  );
}
