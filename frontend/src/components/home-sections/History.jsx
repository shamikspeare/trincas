import React from 'react';
import historyImg from '../../assets/history.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const History = () => {
    return (
        <section className="bg-[#f5f0e8] flex flex-col items-center pt-6 pb-4 px-4 mb-10 md:mb-16">

            {/* Section Heading */}
            <FadeIn delay={0}>
                <h2 className="uppercase text-[#3D2B1F] text-center font-light mb-4">
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.2em] sm:tracking-[0.3em] leading-none">Our Heritage</span>
                </h2>
            </FadeIn>

            {/* History Image */}
            <div className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mb-4">
                <img
                    src={historyImg}
                    alt="History of Trincas"
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Text Content */}
            <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">

                {/* Diamond Separator */}
                <FadeIn delay={0}>
                    <div className="flex items-center justify-center my-3 opacity-70">
                        <div className="w-16 h-[1px] bg-yellow-600/60"></div>
                        <div className="w-2.5 h-2.5 rotate-45 bg-yellow-600/60 mx-2"></div>
                        <div className="w-16 h-[1px] bg-yellow-600/60"></div>
                    </div>
                </FadeIn>

                {/* Body Paragraph */}
                <FadeIn delay={0.2}>
                    <div className="text-base md:text-lg text-gray-800 leading-relaxed max-w-2xl px-2 mb-3">
                        <p>Since 1927, Trincas has been woven into the fabric of Calcutta — where traditions and memories live on.</p>
                    </div>
                </FadeIn>

            </div>

            {/* CTA Button */}
            <FadeIn delay={0.35}>
                <div className="mt-4 flex justify-center w-full">
                    <Button
                        navigation="/history"
                        bgColor="#541A1A"
                        text="history of trincas"
                    />
                </div>
            </FadeIn>

        </section>
    );
};

export default History;
