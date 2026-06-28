import React from 'react';
import heroImg from '../../assets/hero.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const Hero = () => {
  return (
    <section
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-6 px-4"
      style={{
        backgroundColor: '#f5f0e8',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.07\'/%3E%3C/svg%3E")'
      }}
    >
      {/* Hero Image */}
      <FadeIn delay={0} className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mb-8">
        <img
          src={heroImg}
          alt="Trincas Hero"
          className="w-full h-auto object-cover"
        />
      </FadeIn>

      {/* Text Content */}
      <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">

        {/* Main Heading */}
        <FadeIn delay={0}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-widest text-gray-900 mb-2">
            A Legacy Of
          </h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl lowercase italic text-gray-800 tracking-wide mb-6">
            flavour & belonging.
          </h2>
        </FadeIn>

        {/* Short Line Separator */}
        <FadeIn delay={0.3}>
          <div className="w-24 h-[1px] bg-yellow-600/60 mx-auto mb-6"></div>
        </FadeIn>

        {/* Body Paragraphs */}
        <FadeIn delay={0.4}>
          <div className="space-y-4 text-lg md:text-xl text-gray-800 leading-relaxed max-w-2xl px-2">
            <p>
              Since 1927, Trincas has been more than a restaurant.
            </p>
            <p>
              It has been a part of Calcutta's story —<br />
              where conversations linger, traditions thrive,<br />
              and every meal feels like coming home.
            </p>
          </div>
        </FadeIn>

        {/* Diamond Separator */}
        <FadeIn delay={0.5}>
          <div className="flex items-center justify-center my-6 opacity-70">
            <div className="w-16 h-[1px] bg-yellow-600/60"></div>
            <div className="w-2.5 h-2.5 rotate-45 bg-yellow-600/60 mx-2"></div>
            <div className="w-16 h-[1px] bg-yellow-600/60"></div>
          </div>
        </FadeIn>

        {/* Footer Text */}
        <FadeIn delay={0.6}>
          <div className="text-gray-900 mb-8">
            <p className="uppercase tracking-widest text-sm md:text-base font-medium mb-2">
              Some places serve food.
            </p>
            <p className="italic text-xl md:text-2xl text-gray-800">
              We serve memories.
            </p>
          </div>
        </FadeIn>

        {/* CTA Button */}
        <FadeIn delay={0.7}>
          <Button
            navigation="/story"
            bgColor="#541A1A"
            text="know our story"
          />
        </FadeIn>

      </div>
    </section>
  );
};

export default Hero;
