import React from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '../Breadcrumb';
import Footer from '../Footer';

import grid1 from '../../assets/musicgrid1.jpeg';
import grid2 from '../../assets/musicgrid2.jpeg';
import grid3 from '../../assets/musicgrid3.jpeg';
import grid4 from '../../assets/musicgrid4.jpeg';
import grid5 from '../../assets/musicgrid5.jpeg';
import grid6 from '../../assets/musicgrid6.jpeg';

const MusicSchedule = () => {
    const staggeredImages = [grid1, grid2, grid3, grid4, grid5, grid6];

    return (
        <main className="w-full bg-white min-h-screen flex flex-col text-gray-900">
            <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Music', link: '/music' }, { label: 'Schedule' }]} />

            <div className="w-full flex justify-center pt-10 pb-2 px-4">
                <h2
                    className="text-center text-black font-medium tracking-wide whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                    Full Music Schedule
                </h2>
            </div>

            {/* Increased Vertical Space: gap-16 (mobile) and gap-24 (desktop) */}
            <div className="w-full max-w-xl mx-auto px-6 pt-10 pb-20 flex flex-col gap-16 sm:gap-24">
                {staggeredImages.map((src, index) => {
                    const isRight = index % 2 === 0;
                    const alignClass = isRight ? 'self-end' : 'self-start';

                    return (
                        <motion.div
                            key={index}
                            className={`${alignClass} w-[75%] sm:w-[65%] bg-white rounded-2xl`}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{
                                delay: index * 0.1,
                                duration: 0.5,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <div
                                aria-label={`Music schedule grid item ${index + 1}`}
                                className="block overflow-hidden rounded-2xl transition-transform duration-300"
                            >
                                <div className="w-full overflow-hidden bg-gray-50">
                                    <img
                                        src={src}
                                        alt={`Music schedule grid item ${index + 1}`}
                                        className="w-full h-auto transition-transform duration-700 ease-out"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <Footer />
        </main>
    );
};

export default MusicSchedule;