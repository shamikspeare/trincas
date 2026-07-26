import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const decades = [
  "1950s",
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
];

const TOTAL_TICKS = 42;
const TICKS_PER_DECADE = TOTAL_TICKS / decades.length;
const STEP_ANGLE = (360 / TOTAL_TICKS) * TICKS_PER_DECADE;
const INITIAL_ROTATION = 90;

// How close (in degrees) a decade must be to the active position to show the button
const SNAP_THRESHOLD = 10;

export default function ScrollCircle() {
  const containerRef = useRef(null);
  const dialRef = useRef(null);
  const currentRotation = useRef(INITIAL_ROTATION);
  const [showButton, setShowButton] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Helper: update button visibility based on how close we are to a decade
  const updateButtonVisibility = useCallback(() => {
    // Convert current rotation back to a continuous index
    const continuousIndex =
      (INITIAL_ROTATION - currentRotation.current) / STEP_ANGLE;

    const nearest = Math.round(continuousIndex);
    const distance = Math.abs(continuousIndex - nearest) * STEP_ANGLE;

    const isNear = distance < SNAP_THRESHOLD;

    setShowButton(isNear);
    if (isNear) {
      const len = decades.length;
      // Use modulo arithmetic to ensure activeIndex loops correctly and handles negative values
      const wrappedIndex = ((nearest % len) + len) % len;
      setActiveIndex(wrappedIndex);
    }
  }, []);

  // Continuous rotation (no snapping / no flick)
  const applyRotation = useCallback((deltaDegrees) => {
    if (!dialRef.current) return;

    currentRotation.current += deltaDegrees;
    gsap.set(dialRef.current, {
      rotate: currentRotation.current,
    });

    updateButtonVisibility();
  }, [updateButtonVisibility]);

  // Desktop wheel → continuous
  // Attached natively to avoid passive event listener warnings
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      // positive deltaY (scroll down) rotates one way, negative the other
      // sensitivity tuned for a natural feel
      const delta = e.deltaY * 0.12;
      applyRotation(-delta);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [applyRotation]);

  // Mobile drag → continuous (updates every frame of the pan)
  const handlePan = (_, info) => {
    // info.delta.y is the movement since last event
    const delta = info.delta.y * 0.35;
    applyRotation(delta);
  };

  // Optional light inertia on release (still continuous, no discrete flick)
  const handlePanEnd = (_, info) => {
    const velocity = info.velocity.y;
    if (Math.abs(velocity) < 80) {
      updateButtonVisibility();
      return;
    }

    // short coast that decays naturally
    const coast = velocity * 0.08;
    gsap.to(currentRotation, {
      current: currentRotation.current + coast,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (!dialRef.current) return;
        gsap.set(dialRef.current, {
          rotate: currentRotation.current,
        });
        updateButtonVisibility();
      },
    });
  };

  const handleExploreClick = () => {
    navigate(`/history/${decades[activeIndex]}`);
  };

  return (
    <motion.section
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-white text-gray-900 touch-none"
      onPan={handlePan}
      onPanEnd={handlePanEnd}
    >
      
      {/* Dial */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          ref={dialRef}
          className="
            relative flex items-center justify-center bg-transparent
            h-[300px] w-[300px]
            sm:h-[400px] sm:w-[400px]
            md:h-[700px] md:w-[700px]
          "
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
                <span
                  className={`
                    shrink-0 h-[2px]
                    ml-[185px]
                    sm:ml-[250px]
                    md:ml-[500px]
                    ${
                      isMainTick
                        ? "w-[30px] sm:w-[50px] bg-gray-800"
                        : "w-[20px] sm:w-[30px] bg-gray-300"
                    }
                  `}
                />

                {isMainTick && (
                  <span
                    className="
                      whitespace-nowrap font-medium text-gray-400
                      ml-[14px] sm:ml-[20px] md:ml-[18px]
                      text-[26px] sm:text-[40px]
                    "
                  >
                    {decadeText}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore button – only visible when a decade is near the active position */}
      <motion.button
        className="
          absolute z-10 flex items-center gap-2
          rounded-full bg-black text-white font-medium

          right-[10px] top-[calc(50%+28px)]
          px-4 py-2 text-xs

          sm:right-[10px] sm:top-[calc(50%+34px)]
          sm:px-5 sm:py-2.5 sm:text-sm

          md:right-auto md:left-[530px] md:top-[calc(50%+38px)]
          md:px-6 md:py-3 md:text-base
        "
        initial={false}
        animate={{
          opacity: showButton ? 1 : 0,
          y: showButton ? 0 : 8,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          pointerEvents: showButton ? "auto" : "none",
        }}
        onClick={handleExploreClick}
      >
        Explore
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
      </motion.button>
    </motion.section>
  );
}