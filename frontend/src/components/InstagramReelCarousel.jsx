import { motion } from "framer-motion";
import InstagramReelEmbed from "./InstagramReelEmbed";
import { normalizeInstagramUrl } from "../lib/pageLayouts";

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

export default function InstagramReelCarousel({ videos, title }) {
  const validVideos = videos
    .map((video) => ({ ...video, canonicalUrl: normalizeInstagramUrl(video.instagram_url) }))
    .filter((video) => video.canonicalUrl);
    
  if (!validVideos.length) return null;

  return (
    <motion.section variants={sectionVariants} className="mt-10 sm:mt-12">
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-4 snap-x snap-mandatory">
          {validVideos.map((video) => (
            <div
              key={video.id}
              className="snap-start shrink-0 w-[280px] sm:w-[320px]"
            >
              <InstagramReelEmbed url={video.canonicalUrl} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
