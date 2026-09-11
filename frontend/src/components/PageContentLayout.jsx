import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import InstagramReelCarousel from "./InstagramReelCarousel";

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
      <span className="h-px w-8 bg-[#caa56a] opacity-70" />
      <h2 className="font-serif text-[clamp(1.8rem,6vw,3rem)] leading-none text-[#1e1e1e]">{children}</h2>
      <span className="h-px w-8 bg-[#caa56a] opacity-70" />
    </div>
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
              <div className="h-full overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-[0_10px_30px_rgba(23,15,7,0.08)]">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt={card.alt_text || ""}
                    className="aspect-[4/3] h-auto w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-[#7d6c59]">
                    <ImageOff className="h-6 w-6 opacity-60" />
                  </div>
                )}
                <div className="p-4 text-center">
                  <h3 className="font-serif text-lg text-[#1d1d1d]">{card.alt_text || ""}</h3>
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
}) {
  const paragraphs = (layout?.body || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const hasContent = Boolean(
    layout?.heading ||
    layout?.lead_image_url ||
    paragraphs.length > 0 ||
    imageCards.length > 0 ||
    instagramVideos.length > 0
  );

  const Wrapper = embedded ? "div" : "main";

  return (
    <Wrapper className={backgroundClass}>
      {breadcrumbs?.length ? <Breadcrumb items={breadcrumbs} /> : null}
      {hasContent ? (
        <motion.div
          className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {layout?.heading ? (
            <motion.header variants={sectionVariants} className="mx-auto max-w-4xl text-center">
              <h1 className="font-serif text-[clamp(2.3rem,7vw,4.5rem)] leading-none text-[#1e1e1e]">{layout.heading}</h1>
            </motion.header>
          ) : null}

          {layout?.lead_image_url ? (
            <motion.section variants={sectionVariants} className="mx-auto mt-4 max-w-5xl overflow-hidden rounded-[22px]">
              <img src={layout.lead_image_url} alt="" className="h-auto w-full object-cover" loading="eager" decoding="async" />
            </motion.section>
          ) : null}

          {paragraphs.length ? (
            <motion.section variants={sectionVariants} className="mx-auto mt-6 max-w-4xl space-y-4 text-base leading-relaxed text-[#514638] sm:text-lg">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </motion.section>
          ) : null}

          <ImageCarousel cards={imageCards} title={imageCardsTitle} />
          <InstagramReelCarousel videos={instagramVideos} title={instagramTitle} />
        </motion.div>
      ) : null}
    </Wrapper>
  );
}
