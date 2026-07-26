import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import YearDial from "./YearDial";
import historyImg from "../../assets/history.jpeg";
import diningImg from "../../assets/dining.jpeg";
import foodImg from "../../assets/food.jpeg";
import musicImg from "../../assets/music.jpeg";
import pressImg from "../../assets/home-press.jpeg";
import tavernHomeImg from "../../assets/tavern-home.jpeg";
import mingHomeImg from "../../assets/ming-home.jpeg";
import trincasHomeImg from "../../assets/trincas-home.jpeg";
import foodIndianImg from "../../assets/food-indian.jpg";
import foodChineseImg from "../../assets/food-chinese.jpg";

const placeholderImages = [
  historyImg,
  diningImg,
  foodImg,
  musicImg,
  pressImg,
  tavernHomeImg,
  mingHomeImg,
  trincasHomeImg,
  foodIndianImg,
  foodChineseImg,
];

const getCurrentDecadeStart = () => Math.floor(new Date().getFullYear() / 10) * 10;

const parseDecadeStart = (decade) => {
  const match = decade?.match(/^(\d{4})s$/);
  if (!match) return getCurrentDecadeStart();

  const parsedYear = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsedYear)) return getCurrentDecadeStart();

  return parsedYear;
};

const pickRandomImages = (pool, total) => {
  const picked = [];
  for (let index = 0; index < total; index += 1) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    picked.push(pool[randomIndex]);
  }
  return picked;
};

export default function HistoryYearPage() {
  const navigate = useNavigate();
  const { decade } = useParams();
  const decadeStart = useMemo(() => parseDecadeStart(decade), [decade]);
  const years = useMemo(
    () => Array.from({ length: 10 }, (_, index) => String(decadeStart + index)),
    [decadeStart]
  );
  const [activeYear, setActiveYear] = useState(years[0]);

  useEffect(() => {
    setActiveYear(years[0]);
  }, [years]);

  const activeYearImages = useMemo(
    () => pickRandomImages(placeholderImages, 6),
    [activeYear]
  );

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white px-4 pb-12 pt-6 sm:px-6 md:px-10">
      <button
        type="button"
        onClick={() => navigate("/history")}
        className="
          fixed z-30
          top-[74px] left-4
          sm:left-6
          md:left-10
          rounded-full bg-gray-200 text-gray-700
          px-3 py-1.5 text-xs
          sm:px-4 sm:py-2 sm:text-sm
          md:px-5 md:py-2.5 md:text-base
          font-medium tracking-wide
          transition-colors duration-200
          hover:bg-gray-300
          cursor-pointer
        "
      >
        Change Decade
      </button>

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center">
        <div className="mt-10 sm:mt-12 md:mt-14 w-full">
          <YearDial years={years} activeYear={activeYear} setActiveYear={setActiveYear} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl">
        <h1 className="mt-10 text-start text-3xl font-bold tracking-tight text-gray-900 sm:mt-12 sm:text-4xl md:mt-14 md:text-5xl">
          {activeYear}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
          This is placeholder content for {activeYear}, highlighting notable moments from the decade while
          development content is being prepared.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {activeYearImages.map((image, index) => (
            <article key={`${activeYear}-${index}`} className="aspect-[4/3] overflow-hidden rounded-2xl">
              <img
                src={image}
                alt={`${activeYear} historical placeholder ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
