import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import PageLayoutEditor from "../components/PageLayoutEditor";
import { MUSIC_SCHEDULE_PAGE_KEY, MUSIC_TAVERN_SCHEDULE_PAGE_KEY } from "../../lib/pageLayouts";

const MUSIC_PAGES = [
  { key: MUSIC_SCHEDULE_PAGE_KEY, title: "Music Schedule", desc: "Manage the content shown on the Music Schedule page." },
  { key: MUSIC_TAVERN_SCHEDULE_PAGE_KEY, title: "Tavern Schedule", desc: "Manage the content shown on the Tavern Music Schedule page." },
];

function Toast({ toast }) {
  if (!toast) return null;
  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;
  return <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-lg"><Icon className="h-4 w-4" />{toast.message}</motion.div>;
}

export default function MusicEditor() {
  const [activePage, setActivePage] = useState(MUSIC_PAGES[0]);
  const [toast, setToast] = useState(null);

  function notify(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <AnimatePresence>{toast ? <Toast toast={toast} /> : null}</AnimatePresence>
      <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Music Schedules</h1>
      <p className="mt-1 text-base text-gray-500 sm:text-lg">Manage the content for the dynamic music schedule pages.</p>
      
      <div className="mt-6 flex flex-wrap gap-2">
        {MUSIC_PAGES.map((page) => (
          <button
            key={page.key}
            type="button"
            onClick={() => setActivePage(page)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activePage.key === page.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page.title}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-2 text-xl font-medium text-gray-900">{activePage.title}</h2>
        <p className="mb-6 text-sm text-gray-500">{activePage.desc}</p>
        <PageLayoutEditor pageKey={activePage.key} title={activePage.title} notify={notify} />
      </div>
    </div>
  );
}
