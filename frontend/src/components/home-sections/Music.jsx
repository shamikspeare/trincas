import React from 'react';
import musicImg from '../../assets/music.png';
import vinylImg from '../../assets/vinyl.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const Music = () => {
    return (
        <section className="bg-[#f8f6f2] flex flex-col items-center pt-24 pb-6 md:pt-32 px-4">

            {/* Section Heading */}
            <FadeIn delay={0}>
                <h2 className="text-3xl md:text-4xl lg:text-5xl uppercase tracking-widest text-gray-900 mb-6 text-center">
                    Where Heritage Meets Harmony
                </h2>
            </FadeIn>

            {/* Music Image */}
            <div className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mb-4">
                <img
                    src={musicImg}
                    alt="Trincas Music"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Text Content */}
            <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">

                {/* Vinyl Illustration with decorative scrolls */}
                <FadeIn delay={0}>
                    <div className="flex items-center justify-center my-6 opacity-80">
                        <svg className="w-12 h-6" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M55 10C55 10 50 10 48 8C46 6 44 4 40 4C36 4 34 6 30 6" stroke="#8B6914" strokeWidth="1" fill="none" />
                            <path d="M55 10C55 10 50 10 48 12C46 14 44 16 40 16C36 16 34 14 30 14" stroke="#8B6914" strokeWidth="1" fill="none" />
                        </svg>
                        <img
                            src={vinylImg}
                            alt="Vinyl"
                            className="w-32 h-32 mx-3 object-contain"
                        />
                        <svg className="w-12 h-6 scale-x-[-1]" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M55 10C55 10 50 10 48 8C46 6 44 4 40 4C36 4 34 6 30 6" stroke="#8B6914" strokeWidth="1" fill="none" />
                            <path d="M55 10C55 10 50 10 48 12C46 14 44 16 40 16C36 16 34 14 30 14" stroke="#8B6914" strokeWidth="1" fill="none" />
                        </svg>
                    </div>
                </FadeIn>

                {/* Body Paragraph */}
                <FadeIn delay={0.2}>
                    <div className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-2xl px-2 space-y-4">
                        <p>
                            For decades, Trincas has been more than a restaurant.
                        </p>
                        <p>
                            It has been a stage for timeless melodies,<br />
                            where music, like our cuisine,<br />
                            is served with soul.
                        </p>
                    </div>
                </FadeIn>

            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
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
