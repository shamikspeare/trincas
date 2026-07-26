import React, { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ChevronsDown } from "lucide-react";

const TICKS_PER_YEAR = 6;
const INITIAL_ROTATION = 90;

export default function YearDial({ years, activeYear, setActiveYear }) {
  const dialInteractionRef = useRef(null);
  const dialRef = useRef(null);
  const currentRotation = useRef(INITIAL_ROTATION);

  const totalTicks = years.length * TICKS_PER_YEAR;
  const stepAngle = 360 / years.length;

  const updateActiveYear = useCallback(() => {
    const continuousIndex =
      (INITIAL_ROTATION - currentRotation.current) / stepAngle;
    const nearest = Math.round(continuousIndex);
    const wrappedIndex = ((nearest % years.length) + years.length) % years.length;
    setActiveYear(years[wrappedIndex]);
  }, [setActiveYear, stepAngle, years]);

  const applyRotation = useCallback(
    (deltaDegrees) => {
      if (!dialRef.current) return;

      currentRotation.current += deltaDegrees;
      gsap.set(dialRef.current, {
        rotate: currentRotation.current,
      });

      updateActiveYear();
    },
    [updateActiveYear]
  );

  useEffect(() => {
    const interactionContainer = dialInteractionRef.current;
    if (!interactionContainer) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.12;
      applyRotation(-delta);
    };

    interactionContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      interactionContainer.removeEventListener("wheel", handleWheel);
    };
  }, [applyRotation]);

  useEffect(() => {
    currentRotation.current = INITIAL_ROTATION;
    if (dialRef.current) {
      gsap.set(dialRef.current, {
        rotate: INITIAL_ROTATION,
      });
    }
    setActiveYear(years[0]);
  }, [setActiveYear, years]);

  const handlePan = (_, info) => {
    const delta = info.delta.y * 0.35;
    applyRotation(delta);
  };

  const handlePanEnd = (_, info) => {
    const velocity = info.velocity.y;
    if (Math.abs(velocity) < 80) {
      updateActiveYear();
      return;
    }

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
        updateActiveYear();
      },
    });
  };

  return (
    <section className="relative w-full overflow-visible flex flex-col items-center">
      {/* Dedicated Interaction Container */}
      <motion.div
        ref={dialInteractionRef}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="
          relative touch-none 
          py-8 px-12 sm:py-10 sm:px-16 md:py-12 md:px-24
          flex items-center justify-center
        "
      >
        <div
          className="
            relative
            h-[100px] w-[100px]
            sm:h-[138px] sm:w-[138px]
            md:h-[250px] md:w-[250px]
          "
        >
          {/* Solid left-pointing arrow outside dial & year labels (points to active year) */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 z-20 pointer-events-none ml-[75px] sm:ml-[90px] md:ml-[129px]">
            <div
              className="
                w-0 h-0
                border-t-[9.5px] border-b-[9.5px] border-r-[13px]
                sm:border-t-[11.5px] sm:border-b-[11.5px] sm:border-r-[15px]
                md:border-t-[15px] md:border-b-[15px] md:border-r-[20.5px]
                border-t-transparent border-b-transparent border-r-black
              "
            />
          </div>

          <div
            ref={dialRef}
            className="
              relative flex items-center justify-center bg-transparent
              h-[100px] w-[100px]
              sm:h-[138px] sm:w-[138px]
              md:h-[250px] md:w-[250px]
            "
            style={{
              transform: `rotate(${INITIAL_ROTATION}deg)`,
            }}
          >
            {[...Array(totalTicks).keys()].map((_, index) => {
              const angle = (index / totalTicks) * 360;
              const isMainTick = index % TICKS_PER_YEAR === 0;
              const yearText = isMainTick ? years[index / TICKS_PER_YEAR] : null;

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
                      shrink-0 h-[1px]
                      ml-[60px]
                      sm:ml-[81px]
                      md:ml-[150px]
                      ${
                        isMainTick
                          ? "w-[13px] sm:w-[16px] md:w-[25px] bg-gray-800"
                          : "w-[8px] sm:w-[10px] md:w-[15px] bg-gray-300"
                      }
                    `}
                  />

                  {isMainTick && (
                    <span
                      className="
                        whitespace-nowrap font-medium text-gray-400
                        ml-[6px] sm:ml-[8px] md:ml-[10px]
                        text-[14px] sm:text-[16px] md:text-[22px]
                      "
                    >
                      {yearText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center active year */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[22px] sm:text-[25px] md:text-[38px] font-semibold text-gray-900">
            {activeYear}
          </div>
        </div>
      </motion.div>

      <div className="mt-12 mb-16 flex flex-col items-center text-gray-300 sm:mt-10 sm:mb-20 md:mt-12 md:mb-24">
        <ChevronsDown className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
        <p className="mt-3 text-xs sm:text-sm font-medium tracking-[0.12em]">Scroll Down</p>
      </div>
    </section>
  );
}