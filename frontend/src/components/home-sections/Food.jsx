import React from 'react';
import food1Img from '../../assets/food1.png';
import food2Img from '../../assets/food2.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")`;

const Food = () => {
  return (
    <section
      className="relative flex flex-col items-center py-10 px-6 overflow-hidden"
      style={{ backgroundColor: '#f6dbbb' }}
    >
      {/* Grain overlay — covers entire section including images */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: GRAIN_SVG, zIndex: 10 }}
      />

      {/* Section Heading */}
      <FadeIn delay={0}>
        <h2 className="uppercase text-[#3D2B1F] text-center font-light flex flex-col items-center">
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.2em] sm:tracking-[0.3em] mb-2 leading-none">Food</span>
          <span className="text-lg sm:text-xl md:text-2xl text-[#9A7B4F] mb-2 font-serif italic leading-none">&amp;</span>
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.2em] sm:tracking-[0.3em] leading-none">Beverages</span>
        </h2>
      </FadeIn>

      {/* Decorative separator under heading */}
      <FadeIn delay={0.1}>
        <div className="flex items-center justify-center mt-3 mb-2">
          <div className="w-16 md:w-24 h-[1px] bg-[#9A7B4F]"></div>
          <div className="flex items-center mx-3 gap-1">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#9A7B4F]"></div>
            <div className="w-2 h-2 rotate-45 bg-[#9A7B4F]"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#9A7B4F]"></div>
          </div>
          <div className="w-16 md:w-24 h-[1px] bg-[#9A7B4F]"></div>
        </div>
      </FadeIn>

      {/* Food 1 Image — large, bleeds out, offset right */}
      <FadeIn delay={0.15} className="w-[120%] -mr-8 self-end">
        <img
          src={food1Img}
          alt="Trincas Sizzler"
          className="w-full h-auto object-contain"
        />
      </FadeIn>

      {/* Text Content */}
      <div className="w-full max-w-xs mx-auto text-center flex flex-col items-center -mt-4 px-2">

        {/* Main Text */}
        <FadeIn delay={0}>
          <h3 className="text-xl sm:text-2xl md:text-3xl text-[#3D2B1F] leading-snug font-light">
            More than just a meal.
          </h3>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h3 className="text-xl sm:text-2xl md:text-3xl text-[#3D2B1F] leading-snug font-light mt-0.5">
            It's a <em className="font-serif">memory</em>.
          </h3>
        </FadeIn>

        {/* Short Line Separator */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-center my-3">
            <div className="w-10 h-[1px] bg-[#9A7B4F]/60"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#9A7B4F]/60 mx-2"></div>
            <div className="w-10 h-[1px] bg-[#9A7B4F]/60"></div>
          </div>
        </FadeIn>

        {/* Body Paragraph */}
        <FadeIn delay={0.3}>
          <p className="text-sm sm:text-base text-[#5C4A3A] leading-relaxed">
            From our signature Fish Orly to the iconic
            Trincas Sizzler, every dish is a reminder
            of old Calcutta and the people who
            made it unforgettable.
          </p>
        </FadeIn>

      </div>

      {/* Food 2 Image — large, bleeds out, offset left */}
      <FadeIn delay={0.2} className="w-[120%] -ml-8 self-start -mt-2">
        <img
          src={food2Img}
          alt="Trincas Kebab"
          className="w-full h-auto object-contain"
        />
      </FadeIn>

      {/* CTA Button */}
      <FadeIn delay={0.3}>
        <div className="-mt-4 flex justify-center w-full">
          <Button
            navigation="/menu"
            bgColor="#541A1A"
            text="discover our menu"
          />
        </div>
      </FadeIn>

    </section>
  );
};

export default Food;
