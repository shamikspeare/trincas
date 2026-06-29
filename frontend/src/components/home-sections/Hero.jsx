import React from 'react';
import heroImg from '../../assets/hero.jpg';
import illustrationImg from '../../assets/home-illustration.jpeg';
import FadeIn from '../FadeIn';

const Hero = () => {
  return (
    <section
      className="flex flex-col items-center px-4"
      style={{
        backgroundColor: '#faedda',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.07\'/%3E%3C/svg%3E")',
        paddingTop: '40px',
      }}
    >
      {/* Hero Image & Link */}
      <FadeIn delay={0} className="w-full px-2 sm:px-0 sm:mx-auto max-w-5xl flex flex-col items-center">
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="w-full flex flex-col items-center group cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-[1.01]"
        >
          <img
            src={heroImg}
            alt="Dining Spaces"
            className="w-full h-auto object-cover rounded-3xl"
          />
          <div className="mt-5 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#6B4D2F] font-serif tracking-wide transition-colors duration-300 group-hover:text-[#4A3520] mb-4">
              Dining Spaces
            </h2>
            <div className="flex items-center justify-center mt-1 mb-6 opacity-80">
              <div className="w-12 h-[1px] bg-[#6B4D2F]"></div>
              <div className="w-2 h-2 rotate-45 bg-[#6B4D2F] mx-2"></div>
              <div className="w-12 h-[1px] bg-[#6B4D2F]"></div>
            </div>
            <p className="text-sm sm:text-base text-[#7A6550] mt-2 tracking-wide">
              Where every table tells a story
            </p>
            <p className="text-xs text-[#9A7B4F] italic mt-1.5">
              since 1927
            </p>
          </div>
        </button>
      </FadeIn>

      {/* Home Illustration */}
      <FadeIn delay={0.2} className="w-[75%] sm:w-[65%] mx-auto max-w-3xl mt-8">
        <img
          src={illustrationImg}
          alt="Trincas Illustration"
          className="w-full h-auto object-cover opacity-70"
        />
      </FadeIn>
    </section>
  );
};

export default Hero;