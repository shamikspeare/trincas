import React from 'react';

const Button = ({ navigation = "#", bgColor = "#541A1A", text = "Click Me" }) => {
    return (
        <a
            href={navigation}
            style={{ backgroundColor: bgColor }}
            className="w-full max-w-[280px] sm:max-w-[320px] py-4 flex items-center justify-center transition-opacity duration-200 active:opacity-85 rounded-none shadow-sm"
        >
            <span className="font-bold text-white text-base md:text-lg uppercase tracking-widest text-center px-6">
                {text}
            </span>
        </a>
    );
};

export default Button;
