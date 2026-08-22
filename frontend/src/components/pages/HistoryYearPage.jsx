import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import YearDial from "./YearDial";
import { supabase } from "../../lib/supabase";

const getCurrentDecadeStart = () => Math.floor(new Date().getFullYear() / 10) * 10;

const parseDecadeStart = (decade) => {
  const match = decade?.match(/^(\d{4})s$/);
  if (!match) return getCurrentDecadeStart();

  const parsedYear = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsedYear)) return getCurrentDecadeStart();

  return parsedYear;
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
  const [yearContent, setYearContent] = useState(null);
  const [yearImages, setYearImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveYear(years[0]);
  }, [years]);

  useEffect(() => {
    if (!activeYear) return;
    let active = true;
    setLoading(true);

    (async () => {
      const yearNum = Number(activeYear);
      const [{ data: content }, { data: images }] = await Promise.all([
        supabase.from("history_content").select("*").eq("year", yearNum).maybeSingle(),
        supabase.from("history_images").select("*").eq("year", yearNum).order("sort_order"),
      ]);
      if (!active) return;
      setYearContent(content);
      setYearImages(images ?? []);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [activeYear]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-white px-4 pb-12 pt-6 sm:px-6 md:px-10">
      <button
        type="button"
        onClick={() => navigate("/history-timeline")}
        className="
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
        <span className="flex items-center gap-2">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span>Change Decade</span>
        </span>
      </button>

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center">
        <div className="mt-16 sm:mt-20 md:mt-24 w-full">
          <YearDial years={years} activeYear={activeYear} setActiveYear={setActiveYear} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl">
        <h1 className="mt-10 text-start text-3xl font-bold tracking-tight text-gray-900 sm:mt-12 sm:text-4xl md:mt-14 md:text-5xl">
          {activeYear}
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-600">
          {loading
            ? "Loading…"
            : yearContent?.description ?? `No content added yet for ${activeYear}.`}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {!loading &&
            yearImages.map((img) => (
              <article key={img.id} className="overflow-hidden rounded-2xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.image_url}
                    alt={img.caption || `${activeYear} historical`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {img.caption && (
                  <p className="mt-2 text-sm text-gray-600">{img.caption}</p>
                )}
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}