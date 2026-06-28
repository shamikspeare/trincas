import React from 'react';
import food2Img from '../../assets/food2.png';
import foodImg from '../../assets/food.png';
import Button from '../Button';
import FadeIn from '../FadeIn';

const Food = () => {
  return (
    <section className="bg-[#f5f0e8] flex flex-col items-center py-6 px-4 mt-16 md:mt-24">

      {/* Section Heading */}
      <FadeIn delay={0}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl uppercase tracking-widest text-gray-900 mb-6 text-center">
          Food & Beverages
        </h2>
      </FadeIn>

      {/* Food2 Image */}
      <div className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mb-4">
        <img
          src={food2Img}
          alt="Food & Beverages"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Text Content */}
      <div className="w-full max-w-3xl mx-auto text-center flex flex-col items-center">

        {/* Main Text */}
        <FadeIn delay={0}>
          <h3 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-1">
            More than just a meal.
          </h3>
        </FadeIn>
        <FadeIn delay={0.15}>
          <h3 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-1">
            It's a <em>memory</em>.
          </h3>
        </FadeIn>

        {/* Diamond Separator */}
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center my-6 opacity-70">
            <div className="w-16 h-[1px] bg-yellow-600/60"></div>
            <div className="w-2.5 h-2.5 rotate-45 bg-yellow-600/60 mx-2"></div>
            <div className="w-16 h-[1px] bg-yellow-600/60"></div>
          </div>
        </FadeIn>

        {/* Body Paragraph */}
        <FadeIn delay={0.4}>
          <div className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-2xl px-2">
            <p>
              From our signature Fish Orly to the iconic<br />
              Trincas Sizzler, every dish is a reminder<br />
              of old Calcutta and the people who<br />
              made it unforgettable.
            </p>
          </div>
        </FadeIn>

      </div>

      {/* Food Image */}
      <div className="w-[calc(100%+2rem)] -mx-4 sm:w-full sm:mx-auto max-w-5xl mt-6">
        <img
          src={foodImg}
          alt="Trincas Food"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* CTA Button */}
      <FadeIn delay={0.2}>
        <div className="mt-6 flex justify-center w-full">
          <Button
            navigation="/menu"
            bgColor="#541A1A"
            text="discover our menu"
          />
        </div>
      </FadeIn>

    </section>
  );
};

export default Food;
