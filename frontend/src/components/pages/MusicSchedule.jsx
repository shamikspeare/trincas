import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import Footer from "../Footer";
import PageContentLayout from "../PageContentLayout";
import {
  fetchPageLayout,
  MUSIC_SCHEDULE_PAGE_KEY,
} from "../../lib/pageLayouts";

const MusicSchedule = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await fetchPageLayout(MUSIC_SCHEDULE_PAGE_KEY));
    } catch (err) {
      setError(err.message || "Failed to load music schedule page");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-white flex items-center justify-center text-gray-400">
        loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-500">Failed to load the page.</p>

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

  return (
    <main className="w-full min-h-screen bg-white flex flex-col justify-between text-gray-900">
      <PageContentLayout
        breadcrumbs={[
          { label: "Home", link: "/" },
          { label: "Music", link: "/music" },
          { label: "Schedule" },
        ]}
        layout={data?.layout}
        imageCards={data?.imageCards}
        instagramVideos={data?.instagramVideos}
        imageCardsTitle="Timeline"
        instagramTitle="On Instagram"
      />

      <Footer />
    </main>
  );
};

export default MusicSchedule;