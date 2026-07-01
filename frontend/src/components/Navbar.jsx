import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white w-full shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/">
              <img className="h-10 w-auto" src={logo} alt="Trincas" />
            </a>
          </div>

          {/* Hamburger Menu Button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="bg-white border-t border-gray-100 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50 rounded-md">
              Home
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50 rounded-md">
              About
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50 rounded-md">
              Services
            </a>
            <a href="#" className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-50 rounded-md">
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
