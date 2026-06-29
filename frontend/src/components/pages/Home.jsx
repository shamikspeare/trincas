import React from 'react';
import Hero from '../home-sections/Hero';
import Food from '../home-sections/Food';
import Music from '../home-sections/Music';
import History from '../home-sections/History';

const Home = () => {
  return (
    <main>
      <Hero />
      <Food />
      <Music />

      {/* Ornamental Divider */}
      <div className="w-full flex items-center justify-center py-6 px-6 bg-[#f5f0e8]">
        <div className="flex items-center w-full max-w-sm">
          <div className="flex-1 h-[1px] bg-[#3D2B1F]"></div>
          <svg
            viewBox="0 0 80 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-2 w-16 h-7 shrink-0"
          >
            {/* left small dot */}
            <circle cx="8" cy="14" r="2.5" fill="#3D2B1F" />
            {/* left medium dot */}
            <circle cx="20" cy="14" r="3.5" fill="#3D2B1F" />
            {/* center large cluster */}
            <circle cx="40" cy="14" r="6" fill="#3D2B1F" />
            <circle cx="40" cy="5"  r="2.8" fill="#3D2B1F" />
            <circle cx="40" cy="23" r="2.8" fill="#3D2B1F" />
            <circle cx="31" cy="14" r="2.2" fill="#3D2B1F" />
            <circle cx="49" cy="14" r="2.2" fill="#3D2B1F" />
            {/* right medium dot */}
            <circle cx="60" cy="14" r="3.5" fill="#3D2B1F" />
            {/* right small dot */}
            <circle cx="72" cy="14" r="2.5" fill="#3D2B1F" />
          </svg>
          <div className="flex-1 h-[1px] bg-[#3D2B1F]"></div>
        </div>
      </div>

      <History />
    </main>
  );
};

export default Home;
