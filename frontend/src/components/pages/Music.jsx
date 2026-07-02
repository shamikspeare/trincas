import React from 'react';
import Breadcrumb from '../Breadcrumb';

const Music = () => {
  return (
    <main className="w-full bg-[#450a0a] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music' }]} />
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-serif text-[#d4c9b8]">Music</h1>
      </div>
    </main>
  );
};

export default Music;
