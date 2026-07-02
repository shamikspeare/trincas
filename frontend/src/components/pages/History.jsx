import React from 'react';
import Breadcrumb from '../Breadcrumb';

const History = () => {
  return (
    <main className="w-full bg-[#17130e] min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'History' }]} />
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-serif text-[#d4c9b8]">History</h1>
      </div>
    </main>
  );
};

export default History;
