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
          py-10 px-[3.75rem] sm:py-12 sm:px-20 md:py-[3.75rem] md:px-[7.5rem]
          flex items-center justify-center
        "
      >
        <div
          className="
            relative
            h-[125px] w-[125px]
            sm:h-[173px] sm:w-[173px]
            md:h-[313px] md:w-[313px]
          "
        >
          {/* Solid left-pointing arrow outside dial & year labels (points to active year) */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 z-20 pointer-events-none ml-[94px] sm:ml-[113px] md:ml-[161px]">
            <div
              className="
                w-0 h-0
                border-t-[12px] border-b-[12px] border-r-[16px]
                sm:border-t-[14.5px] sm:border-b-[14.5px] sm:border-r-[19px]
                md:border-t-[19px] md:border-b-[19px] md:border-r-[26px]
                border-t-transparent border-b-transparent border-r-black
              "
            />
          </div>

          <div
            ref={dialRef}
            className="
              relative flex items-center justify-center bg-transparent
              h-[125px] w-[125px]
              sm:h-[173px] sm:w-[173px]
              md:h-[313px] md:w-[313px]
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
                      ml-[75px]
                      sm:ml-[101px]
                      md:ml-[188px]
                      ${
                        isMainTick
                          ? "w-[16px] sm:w-[20px] md:w-[31px] bg-gray-800"
                          : "w-[10px] sm:w-[13px] md:w-[19px] bg-gray-300"
                      }
                    `}
                  />

                  {isMainTick && (
                    <span
                      className="
                        whitespace-nowrap font-medium text-gray-400
                        ml-[8px] sm:ml-[10px] md:ml-[13px]
                        text-[18px] sm:text-[20px] md:text-[28px]
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
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[28px] sm:text-[31px] md:text-[48px] font-semibold text-gray-900">
            {activeYear}
          </div>
        </div>
      </motion.div>

      <div className="mt-12 mb-8 flex flex-col items-center text-gray-300 sm:mt-10 sm:mb-12 md:mt-12 md:mb-14">
        <ChevronsDown className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
        <p className="mt-3 text-xs sm:text-sm font-medium tracking-[0.12em]">Scroll Down</p>
      </div>
    </section>
  );
}