import React from 'react';
import Hero from '../home-sections/Hero';
import Food from '../home-sections/Food';
import Music from '../home-sections/Music';
import History from '../home-sections/History';
import SectionBreaker from '../SectionBreaker';

const Home = () => {
  return (
    <main>
      <Hero />
      <SectionBreaker color="#f5f0e8" />
      <Food />
      <SectionBreaker color="#f5f0e8" />
      <Music />
      <SectionBreaker color="#f5f0e8" />
      <History />
    </main>
  );
};

export default Home;
