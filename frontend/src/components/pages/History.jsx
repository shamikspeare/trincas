import React from 'react';
import ScrollCircle from '../ScrollCircle';
import Breadcrumb from '../Breadcrumb';

const History = () => {
  return (
    <main className="w-full bg-white min-h-[60vh] grid">
      <div className="col-start-1 row-start-1 w-full z-50 pointer-events-none">
        <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'History' }]} />
      </div>
      
      <div className="col-start-1 row-start-1 w-full">
        <ScrollCircle />
      </div>
    </main>
  );
};

export default History;