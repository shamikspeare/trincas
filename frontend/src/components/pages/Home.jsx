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
      <History />
    </main>
  );
};

export default Home;
