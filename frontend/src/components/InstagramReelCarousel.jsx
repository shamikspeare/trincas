import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getInstagramEmbedUrl, normalizeInstagramUrl } from "../lib/pageLayouts";

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
    .map((video) => {
      const canonicalUrl = normalizeInstagramUrl(video.instagram_url);
      return {
        ...video,
        canonicalUrl,
        embedUrl: canonicalUrl ? getInstagramEmbedUrl(canonicalUrl) : null,
      };
    })
    .filter((video) => video.canonicalUrl && video.embedUrl);
    
  if (!validVideos.length) return null;

  return (
    <motion.section variants={sectionVariants} className="mt-10 sm:mt-12">
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-6 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="flex gap-4 snap-x snap-mandatory">
          {validVideos.map((video, index) => (
            <article key={video.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[23%]">
              <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
                <div className="relative aspect-[9/16] bg-gray-100">
                  <iframe
                    src={video.embedUrl}
                    title={`Instagram video ${index + 1}`}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <a
                  href={video.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950"
                >
                  Open on Instagram
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
