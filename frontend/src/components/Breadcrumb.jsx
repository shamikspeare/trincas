import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const Breadcrumb = ({ items, children }) => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // Hide when scrolling down, show when scrolling up
    if (latest > previous && latest > 50) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.div
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="sticky top-14 z-50 w-full pointer-events-none"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-black/60 pointer-events-auto"
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
        </button>

        {items && items.length > 0 && (
          <nav className="flex h-[26px] items-center flex-wrap rounded-full border border-black/10 bg-white/80 px-3 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md pointer-events-auto">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {item.link ? (
                  <Link to={item.link} className="hover:text-black transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-black">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {children}
      </div>
    </motion.div>
  );
};

export default Breadcrumb;