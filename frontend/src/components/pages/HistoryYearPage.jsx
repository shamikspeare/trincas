import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import YearDial from "./YearDial";
import PageContentLayout from "../PageContentLayout";
import { fetchPageLayout, getHistoryPageKey } from "../../lib/pageLayouts";
import Breadcrumb from "../Breadcrumb";

const getCurrentDecadeStart = () => Math.floor(new Date().getFullYear() / 10) * 10;

// 10 distinct but soft, light gradients — one per year-slot within a decade.
// Each is visually distinguishable without being dark or saturated.
const YEAR_GRADIENTS = [
  // 0 — warm ivory
  { from: "#fdfaf4", via: "#faf6ec", to: "#f5f0e8" },
  // 1 — cool lavender mist
  { from: "#f8f7fd", via: "#f1f0fa", to: "#eceaf5" },
  // 2 — sage whisper
  { from: "#f4f7f4", via: "#ecf3ec", to: "#e5ede5" },
  // 3 — blush parchment
  { from: "#fdf5f5", via: "#faedec", to: "#f3e4e3" },
  // 4 — sky linen
  { from: "#f4f8fc", via: "#ebf2f9", to: "#e2eaf3" },
  // 5 — sand dune
  { from: "#faf8f2", via: "#f5f1e6", to: "#ede8d8" },
  // 6 — rose dust
  { from: "#fdf6f8", via: "#f9ecf0", to: "#f2e2e6" },
  // 7 — mint haze
  { from: "#f3faf7", via: "#e8f5ef", to: "#dceee6" },
  // 8 — golden silk
  { from: "#fdfaf0", via: "#faf4e0", to: "#f3ead0" },
  // 9 — steel mist
  { from: "#f5f6f8", via: "#edf0f4", to: "#e4e8ed" },
];

function parseParam(param) {
  const match = param?.match(/^(\d{4})s?$/);
  if (match) {
    const isDecade = param.endsWith("s");
    const year = match[1];
    const decadeStart = Math.floor(Number.parseInt(year, 10) / 10) * 10;
    return {
      decadeStart,
      initialYear: isDecade ? String(decadeStart) : year,
    };
  }
  const currentDecadeStart = getCurrentDecadeStart();
  return { decadeStart: currentDecadeStart, initialYear: String(currentDecadeStart) };
}

/** Deterministically map a year to one of the 10 gradient slots */
function yearToGradient(year) {
  const offset = Number(year) % 10;
  return YEAR_GRADIENTS[offset];
}

export default function HistoryYearPage() {
  const navigate = useNavigate();
  const { decade } = useParams();
  
  const { decadeStart, initialYear } = useMemo(() => parseParam(decade), [decade]);
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => String(decadeStart + i)), [decadeStart]);
  
  const [activeYear, setActiveYear] = useState(initialYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gradient = useMemo(() => yearToGradient(activeYear), [activeYear]);

  useEffect(() => { setActiveYear(initialYear); }, [initialYear]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchPageLayout(getHistoryPageKey(activeYear))
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.message || "Failed to load history content"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [activeYear]);

  return (
    <>
      <main
        style={{
          background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
          transition: "background 0.5s ease",
        }}
        className="px-4 pt-6 sm:px-6 md:px-10"
      >
        <Breadcrumb items={[]}>
          <button
            type="button"
            onClick={() => navigate("/history-timeline")}
            className="flex h-[26px] items-center rounded-full border border-black/10 bg-white/80 px-3 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white/90 hover:text-black pointer-events-auto"
          >
            Change Decade
          </button>
        </Breadcrumb>

        <section className="mx-auto flex w-full max-w-7xl flex-col items-center">
          <div className="mt-16 w-full sm:mt-20 md:mt-24">
            <YearDial years={years} activeYear={activeYear} setActiveYear={setActiveYear} />
          </div>
        </section>
      </main>

      {/* Gradient fade from colored background to white */}
      <div
        style={{
          background: `linear-gradient(to bottom, ${gradient.to}, white)`,
          transition: "background 0.5s ease",
        }}
        className="h-24 sm:h-32 md:h-40"
        aria-hidden="true"
      />

      {/* Content area on clean white background */}
      <div className="bg-white px-4 pb-12 sm:px-6 md:px-10">
        {loading ? (
          <div className="py-16 text-center text-gray-400">loading...</div>
        ) : error ? (
          <div className="py-16 text-center text-rose-500">{error}</div>
        ) : (
          <>
            <header className="mx-auto mt-2 w-full max-w-5xl text-center">
              <h1 className="font-serif text-5xl font-bold leading-none text-black sm:text-6xl md:text-7xl">
                {activeYear}
              </h1>
            </header>
            <PageContentLayout
              breadcrumbs={[]}
              layout={data?.layout}
              imageCards={data?.imageCards}
              instagramVideos={data?.instagramVideos}
              imageCardsTitle={`${activeYear} Gallery`}
              instagramTitle="On Instagram"
              embedded
              backgroundClass="bg-transparent"
              textColorClass="text-black"
            />
          </>
        )}
      </div>
    </>
  );
}
