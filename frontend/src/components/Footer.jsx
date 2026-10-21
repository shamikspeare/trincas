import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from './Navbar';

const Footer = () => {
    return (
        <footer className="site-footer text-[#d4c9b8]">
            <div className="site-footer__content">
                <div className="site-footer__layout">
                    <section className="site-footer__panel site-footer__contact" aria-label="Contact and social links">
                        <p className="site-footer__eyebrow">Since 1927</p>
                        <address className="not-italic">
                            <p>17B, Park Street, Kolkata 700016</p>
                            <a href="tel:+913322297688">+91 33 2229 7688</a>
                            <a href="mailto:info@trincas.com">info@trincas.com</a>
                        </address>
                        <div className="site-footer__socials">
                            <a href="https://www.instagram.com/trincasrestaurant/" target="_blank" rel="noreferrer" aria-label="Trincas on Instagram">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <circle cx="12" cy="12" r="4.5" />
                                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                                </svg>
                                <span>Instagram</span>
                            </a>
                            <a href="https://www.facebook.com/TrincasRestaurant" target="_blank" rel="noreferrer" aria-label="Trincas on Facebook">
                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </svg>
                                <span>Facebook</span>
                            </a>
                        </div>
                    </section>

                    <div className="site-footer__panel site-footer__copyright">
                        &copy; {new Date().getFullYear()} Trincas. All rights reserved.
                    </div>

                    <nav className="site-footer__panel site-footer__nav" aria-label="Footer navigation">
                        <p className="site-footer__eyebrow">Explore</p>
                        <ul>
                            {NAV_LINKS.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
