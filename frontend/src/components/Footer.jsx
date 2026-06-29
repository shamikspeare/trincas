import React from 'react';
import logo from '../assets/logo.png';

const Footer = () => {
    return (
        <footer className="bg-[#1a1a1a] text-[#d4c9b8] pt-16 pb-8 px-6">
            <div className="max-w-5xl mx-auto flex flex-col items-center text-center">

                {/* Logo */}
                <img
                    src={logo}
                    alt="Trincas"
                    className="h-12 mb-6 brightness-0 invert opacity-90"
                />

                {/* Tagline */}
                <p className="italic text-lg md:text-xl text-[#c4b8a4] mb-8">
                    Since 1927
                </p>

                {/* Diamond Separator */}
                <div className="flex items-center justify-center mb-8 opacity-50">
                    <div className="w-12 h-[1px] bg-[#c4b8a4]"></div>
                    <div className="w-2 h-2 rotate-45 bg-[#c4b8a4] mx-2"></div>
                    <div className="w-12 h-[1px] bg-[#c4b8a4]"></div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 text-sm uppercase tracking-widest">
                    <a href="/menu" className="hover:text-white transition-colors duration-200">Menu</a>
                    <a href="/music-schedule" className="hover:text-white transition-colors duration-200">Music</a>
                    <a href="/history" className="hover:text-white transition-colors duration-200">Our Story</a>
                </nav>

                {/* Contact Info */}
                <div className="text-sm text-[#a09888] space-y-1 mb-10">
                    <p>17B, Park Street, Kolkata 700016</p>
                    <p>+91 33 2229 7688</p>
                </div>

                {/* Bottom Bar */}
                <div className="w-full border-t border-[#333] pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#777] tracking-wide">
                    <span>&copy; {new Date().getFullYear()} Trincas. All rights reserved.</span>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
