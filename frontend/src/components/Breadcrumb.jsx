import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const Breadcrumb = ({ items }) => {
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
      className="sticky top-14 z-40 w-full pointer-events-none"
    >
      <div className="flex items-center gap-2 px-4 py-3 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-[26px] h-[26px] min-w-[26px] bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors shadow-sm pointer-events-auto"
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
        </button>

        <nav className="flex items-center flex-wrap text-xs text-gray-700 font-medium bg-white/40 backdrop-blur-md rounded-full h-[26px] px-3 shadow-sm border border-white/40 pointer-events-auto">
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
      </div>
    </motion.div>
  );
};

export default Breadcrumb;
