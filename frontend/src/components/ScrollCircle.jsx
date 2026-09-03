import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
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

export default function ScrollCircle() {
  const containerRef = useRef(null);
  const dialRef = useRef(null);
  const currentRotation = useRef(INITIAL_ROTATION);
  const navigate = useNavigate();

  // Continuous rotation (no snapping / no flick)
  const applyRotation = useCallback((deltaDegrees) => {
    if (!dialRef.current) return;

    currentRotation.current += deltaDegrees;
    gsap.set(dialRef.current, {
      rotate: currentRotation.current,
    });
  }, []);

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

  useEffect(() => {
    if (!dialRef.current) return;
    const startRotation = INITIAL_ROTATION - STEP_ANGLE * 2; // 1970s
    currentRotation.current = startRotation;
    gsap.set(dialRef.current, { rotate: startRotation });
    gsap.to(currentRotation, {
      current: INITIAL_ROTATION, // 1950s
      duration: 0.85,
      ease: "power2.inOut",
      onUpdate: () => {
        if (!dialRef.current) return;
        gsap.set(dialRef.current, {
          rotate: currentRotation.current,
        });
      },
    });
    return () => {
      gsap.killTweensOf(currentRotation);
    };
  }, []);

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
      },
    });
  };

  return (
    <motion.section
      ref={containerRef}
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-white text-gray-900 touch-none"
      onPan={handlePan}
      onPanEnd={handlePanEnd}
    >
      
      {/* Dial */}
      <div className="pointer-events-auto absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
                  <button
                    type="button"
                    onClick={() => navigate(`/history-timeline/${decadeText}`)}
                    aria-label={`Open ${decadeText} timeline`}
                    className="
                      pointer-events-auto whitespace-nowrap font-medium text-blue-500
                      ml-[14px] sm:ml-[20px] md:ml-[18px]
                      text-[39px] sm:text-[60px]
                    "
                  >
                    {decadeText}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}