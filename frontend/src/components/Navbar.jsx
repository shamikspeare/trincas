import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Dining Spaces', to: '/dining' },
  { label: 'Food & Beverages', to: '/food' },
  { label: 'Music', to: '/music' },
  { label: 'History', to: '/history' },
];

const menuVariants = {
  closed: { y: '-100%', opacity: 0 },
  open: { y: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { y: '-100%', opacity: 0, transition: { duration: 0.25, ease: [0.64, 0, 0.78, 0] } },
};

const containerVariants = {
  closed: {},
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const itemVariants = {
  closed: { y: 24, opacity: 0 },
  open: { y: 0, opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const close = () => setIsOpen(false);

  return (
    <>
      <nav className="bg-white w-full shadow-sm sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" onClick={close}>
                <img className="h-9 w-auto" src={logo} alt="Trincas" />
              </Link>
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-[60] flex flex-col items-center justify-center w-10 h-10 rounded-md text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <motion.span
                animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-5 h-[1.5px] bg-current mb-[4px]"
              />
              <motion.span
                animate={isOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="block w-5 h-[1.5px] bg-current mb-[4px]"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-5 h-[1.5px] bg-current"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="fullscreen-menu"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-0 z-[55] bg-white flex flex-col overflow-y-auto"
            style={{ paddingTop: '3.5rem' /* height of navbar (h-14) */ }}
          >
            {/* Nav links */}
            <motion.ul
              variants={containerVariants}
              initial="closed"
              animate="open"
              className="flex flex-col flex-1 px-8 gap-4 pt-12 pb-8"
            >
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <motion.li key={link.to} variants={itemVariants}>
                    <Link
                      to={link.to}
                      onClick={close}
                      className={`block py-3 border-b border-gray-100 text-4xl transition-colors tracking-wide ${
                        isActive ? 'text-[#3D2B1F] font-medium' : 'text-gray-400 font-light hover:text-gray-600'
                      }`}
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* Bottom – contact & social */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="px-8 pb-12 sm:pb-16 pt-8 flex flex-col gap-4 mt-auto"
            >
              {/* Contact */}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">17B, Park Street, Kolkata 700016</p>
                <p>+91 33 2229 7688</p>
                <p>info@trincas.com</p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-5">
                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4.5"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                {/* Twitter / X */}
                <a href="#" aria-label="X" className="text-gray-500 hover:text-gray-900 transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
