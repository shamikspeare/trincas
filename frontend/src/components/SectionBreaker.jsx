import React from 'react';

const SectionBreaker = ({ color = 'transparent' }) => {
    return (
        <div className="w-full py-10 md:py-14 flex items-center justify-center" style={{ backgroundColor: color }}>
            <div className="flex items-center justify-center gap-3 opacity-50 w-full max-w-xs">
                <div className="flex-1 h-[1px]" style={{ backgroundColor: '#000000' }}></div>
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                    <path d="M8 2 C10 5, 14 6, 14 8 C14 10, 10 11, 8 14 C6 11, 2 10, 2 8 C2 6, 6 5, 8 2Z" fill="#000000" />
                </svg>
                <div className="flex-1 h-[1px]" style={{ backgroundColor: '#000000' }}></div>
            </div>
        </div>
    );
};

export default SectionBreaker;