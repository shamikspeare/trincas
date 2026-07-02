import React from 'react';
import Breadcrumb from '../Breadcrumb';

const Food = () => {
  return (
    <main className="w-full bg-[#fefce8] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Food & Beverages' }]} />
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-serif text-[#3D2B1F]">Food & Beverages</h1>
      </div>
    </main>
  );
};

export default Food;
