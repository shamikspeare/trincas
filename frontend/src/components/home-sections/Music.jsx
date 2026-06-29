import React from 'react';
import musicImg from '../../assets/music.png';
import vinylImg from '../../assets/vinyl.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const Music = () => {
    return (
        <section className="bg-[#f5f0e8] flex flex-col items-center pt-6 pb-4 px-4">

            {/* Section Heading */}
            <FadeIn delay={0}>
                <h2 className="uppercase text-[#3D2B1F] text-center font-light mb-4">
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.2em] sm:tracking-[0.3em] leading-none">Live Music</span>
                </h2>
            </FadeIn>

            {/* Music Image */}
            <div className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mb-0">
                <img
                    src={musicImg}
                    alt="Trincas Music"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Text Content — vinyl overlaps image above */}
            <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center -mt-6 relative z-10">

                {/* Vinyl Illustration with decorative scrolls */}
                <FadeIn delay={0}>
                    <div className="flex items-center justify-center mb-3 opacity-80">
                        <svg className="w-10 h-5" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M55 10C55 10 50 10 48 8C46 6 44 4 40 4C36 4 34 6 30 6" stroke="#8B6914" strokeWidth="1" fill="none" />
                            <path d="M55 10C55 10 50 10 48 12C46 14 44 16 40 16C36 16 34 14 30 14" stroke="#8B6914" strokeWidth="1" fill="none" />
                        </svg>
                        <img
                            src={vinylImg}
                            alt="Vinyl"
                            className="w-24 h-24 mx-3 object-contain"
                        />
                        <svg className="w-10 h-5 scale-x-[-1]" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M55 10C55 10 50 10 48 8C46 6 44 4 40 4C36 4 34 6 30 6" stroke="#8B6914" strokeWidth="1" fill="none" />
                            <path d="M55 10C55 10 50 10 48 12C46 14 44 16 40 16C36 16 34 14 30 14" stroke="#8B6914" strokeWidth="1" fill="none" />
                        </svg>
                    </div>
                </FadeIn>

                {/* Body Paragraph */}
                <FadeIn delay={0.2}>
                    <div className="text-base md:text-lg text-gray-800 leading-relaxed max-w-2xl px-2 mb-3">
                        <p>More than a restaurant — a stage for timeless melodies, where music is served with soul.</p>
                    </div>
                </FadeIn>

            </div>

            {/* Buttons */}
            <div className="mt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <FadeIn delay={0.3}>
                    <Button
                        navigation="/music-schedule"
                        bgColor="#541A1A"
                        text="music schedule"
                    />
                </FadeIn>
                <FadeIn delay={0.45}>
                    <Button
                        navigation="/musical-origins"
                        bgColor="#541A1A"
                        text="our musical origins"
                    />
                </FadeIn>
            </div>

        </section>
    );
};

export default Music;
