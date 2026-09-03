import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import YearDial from "./YearDial";
import PageContentLayout from "../PageContentLayout";
import { fetchPageLayout, getHistoryPageKey } from "../../lib/pageLayouts";

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

function parseDecadeStart(decade) {
  const match = decade?.match(/^(\d{4})s$/);
  return match ? Number.parseInt(match[1], 10) : getCurrentDecadeStart();
}

/** Deterministically map a year to one of the 10 gradient slots */
function yearToGradient(year) {
  const offset = Number(year) % 10;
  return YEAR_GRADIENTS[offset];
}

export default function HistoryYearPage() {
  const navigate = useNavigate();
  const { decade } = useParams();
  const decadeStart = useMemo(() => parseDecadeStart(decade), [decade]);
  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => String(decadeStart + i)), [decadeStart]);
  const [activeYear, setActiveYear] = useState(years[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gradient = useMemo(() => yearToGradient(activeYear), [activeYear]);

  useEffect(() => { setActiveYear(years[0]); }, [years]);

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
    <main
      style={{
        background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.via}, ${gradient.to})`,
        minHeight: "calc(100vh - 64px)",
        transition: "background 0.5s ease",
      }}
      className="px-4 pb-12 pt-6 sm:px-6 md:px-10"
    >
      <button
        type="button"
        onClick={() => navigate("/history-timeline")}
        className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium tracking-wide text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90 sm:px-4 sm:py-2 sm:text-sm"
      >
        <span className="flex items-center gap-2">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          Change Decade
        </span>
      </button>

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center">
        <div className="mt-16 w-full sm:mt-20 md:mt-24">
          <YearDial years={years} activeYear={activeYear} setActiveYear={setActiveYear} />
        </div>
      </section>

      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading…</div>
      ) : error ? (
        <div className="py-16 text-center text-rose-500">{error}</div>
      ) : (
        <>
          <header className="mx-auto mt-2 w-full max-w-5xl text-center">
            <h1 className="font-serif text-5xl font-bold leading-none text-[#2f2014] sm:text-6xl md:text-7xl">
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
          />
        </>
      )}
    </main>
  );
}
