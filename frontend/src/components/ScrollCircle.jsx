import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";

const decades = [
  "1950s",
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
];

// 42 ticks
const TOTAL_TICKS = 42;
const TICKS_PER_DECADE = TOTAL_TICKS / decades.length;
// Angle between two decades
const STEP_ANGLE = (360 / TOTAL_TICKS) * TICKS_PER_DECADE;
// Makes 1950s start on the center horizontal line
const INITIAL_ROTATION = 90;

export default function ScrollCircle() {
  const dialRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const [showButton, setShowButton] = useState(true);

  const animateToIndex = (index) => {
    if (!dialRef.current) return;
    isAnimating.current = true;
    setShowButton(false);

    gsap.to(dialRef.current, {
      rotate: INITIAL_ROTATION + index * STEP_ANGLE,
      duration: 0.6,
      ease: "power3.out",
      onComplete: () => {
        isAnimating.current = false;
        setShowButton(true);
      },
    });
  };

  const next = () => {
    if (isAnimating.current) return;
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1; // infinite
      animateToIndex(nextIndex);
      return nextIndex;
    });
  };

  const previous = () => {
    if (isAnimating.current) return;
    setCurrentIndex((prev) => {
      const nextIndex = prev - 1; // infinite
      animateToIndex(nextIndex);
      return nextIndex;
    });
  };

  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      next();
    } else if (e.deltaY < 0) {
      previous();
    }
  };

  // TikTok / YT Shorts style: react to even tiny flicks via velocity
  const handlePanEnd = (_, info) => {
    const { offset, velocity } = info;

    // Very low distance threshold + velocity check (flick detection)
    const isFlick =
      Math.abs(offset.y) > 8 || Math.abs(velocity.y) > 200;

    if (!isFlick) return;

    // Drag / flick up → clockwise (next)
    // Drag / flick down → counter-clockwise (previous)
    if (offset.y < 0 || velocity.y < 0) {
      next();
    } else {
      previous();
    }
  };

  return (
    <motion.section
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-white text-gray-900 touch-none"
      onWheel={handleWheel}
      onPanEnd={handlePanEnd}
    >
      {/* Positioning Wrapper */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Rotating Dial */}
        <div
          ref={dialRef}
          className="relative flex h-[400px] w-[400px] items-center justify-center bg-transparent md:h-[700px] md:w-[700px]"
          style={{
            transform: `rotate(${INITIAL_ROTATION}deg)`,
          }}
        >
          {[...Array(TOTAL_TICKS).keys()].map((_, index) => {
            const angle = (index / TOTAL_TICKS) * 360;
            const isMainTick = index % TICKS_PER_DECADE === 0;
            const decadeText = isMainTick
              ? decades[index / TICKS_PER_DECADE]
              : null;

            return (
              <div
                key={index}
                className="absolute left-1/2 top-1/2 flex h-0 w-0 items-center justify-start"
                style={{
                  transform: `rotate(${angle - 90}deg)`,
                }}
              >
                {/* Tick */}
                <span
                  className={`ml-[250px] md:ml-[500px] h-[1px] shrink-0 ${
                    isMainTick
                      ? "w-[12px] bg-gray-800"
                      : "w-[6px] bg-gray-300"
                  }`}
                />

                {/* Decade */}
                {isMainTick && (
                  <span className="ml-[20px] whitespace-nowrap text-[40px] font-medium text-gray-400 md:ml-[18px]">
                    {decadeText}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore button – sits just below the active decade text */}
      <div className="absolute inset-x-0 top-[calc(50%+30px)] z-10 flex justify-end pr-[25px] md:top-[calc(50%+36px)]">
        <motion.button
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white md:px-6 md:py-3 md:text-base"
          initial={false}
          animate={{
            opacity: showButton ? 1 : 0,
            y: showButton ? 0 : 6,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ pointerEvents: showButton ? "auto" : "none" }}
        >
          Explore
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
        </motion.button>
      </div>
    </motion.section>
  );
}