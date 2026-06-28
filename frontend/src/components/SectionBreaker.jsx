import React from 'react';

const SectionBreaker = ({ color = '#f5f0eb' }) => {
    return (
        <div className="w-full py-10 md:py-14 flex items-center justify-center" style={{ backgroundColor: color }}>
            <div className="flex items-center gap-3 opacity-40 w-full overflow-hidden">
                <div className="flex-1 h-[2px] bg-yellow-700/50"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-yellow-700/50 shrink-0"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-yellow-700/50 mx-1 shrink-0"></div>
                <div className="w-1.5 h-1.5 rotate-45 bg-yellow-700/50 shrink-0"></div>
                <div className="flex-1 h-[2px] bg-yellow-700/50"></div>
            </div>
        </div>
    );
};

export default SectionBreaker;