import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import PageContentLayout from "../PageContentLayout";
import Footer from "../Footer";
import { fetchPageLayout, MUSIC_PAGE_KEY } from "../../lib/pageLayouts";
import trincasMusicScheduleImage from "../../assets/music-stars-of-trincas.png";
import tavernMusicScheduleImage from "../../assets/music-origins.png";
import musicLegacyImage from "../../assets/music-weekdays.png";

export default function Music() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await fetchPageLayout(MUSIC_PAGE_KEY));
    } catch (err) {
      setError(err.message || "Failed to load music page");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-white flex items-center justify-center text-gray-500">
        Loading music…
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-500">Failed to load the music page.</p>

        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </main>
    );
  }

  const musicSubPages = [
    {
      heading: "Trincas Music Schedule",
      image: trincasMusicScheduleImage,
      link: "/music-schedule",
    },
    {
      heading: "Tavern Music Schedule",
      image: tavernMusicScheduleImage,
      link: "/music-tavern-schedule",
    },
    {
      heading: "Music Legacy",
      image: musicLegacyImage,
      link: "/music-legacy",
    },
  ];

  return (
    <>
      <PageContentLayout
        breadcrumbs={[{ label: "Home", link: "/" }, { label: "Music" }]}
        layout={data?.layout}
        imageCards={data?.imageCards}
        instagramVideos={data?.instagramVideos}
        imageCardsTitle="Music Highlights"
        instagramTitle="On Instagram"
      />

      <section className="mx-auto w-full max-w-5xl px-4 pt-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:gap-12">
          {musicSubPages.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="mx-auto flex w-full max-w-2xl flex-col items-center transition-opacity hover:opacity-90"
            >
              <img
                src={item.image}
                alt={item.heading}
                className="h-auto w-full rounded-3xl object-cover"
                loading="lazy"
                decoding="async"
              />

              <h2
                className="mt-4 text-center text-black"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 5vw, 3.1rem)",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                {item.heading}
              </h2>

              <span className="mt-5 h-px w-20 bg-gray-300" />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}