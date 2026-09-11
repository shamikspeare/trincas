import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import PageLayoutEditor from "../components/PageLayoutEditor";
import { getHistoryPageKey } from "../../lib/pageLayouts";

const decades = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];
const getYears = (decade) => Array.from({ length: 10 }, (_, index) => String(Number.parseInt(decade, 10) + index));

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed right-6 top-6 z-50 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium shadow-xl backdrop-blur-md max-w-md ${
        isError
          ? "border-rose-200 bg-rose-50/95 text-rose-800"
          : "border-emerald-200 bg-white/95 text-gray-800"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isError ? "text-rose-600" : "text-emerald-600"}`} />
      <div className="flex-1">{toast.message}</div>
    </motion.div>
  );
}

export default function HistoryEditor() {
  const [selectedDecade, setSelectedDecade] = useState(decades[0]);
  const [selectedYear, setSelectedYear] = useState(getYears(decades[0])[0]);
  const [toast, setToast] = useState(null);
  const years = getYears(selectedDecade);

  function changeDecade(decade) {
    setSelectedDecade(decade);
    setSelectedYear(getYears(decade)[0]);
  }

  function notify(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-10 py-8">
      <AnimatePresence>{toast ? <Toast toast={toast} /> : null}</AnimatePresence>
      <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">History</h1>
      <p className="mt-1 text-base text-gray-500 sm:text-lg">Manage the shared page layout for every History year.</p>
      <div className="mt-8 flex flex-wrap gap-2">{decades.map((decade) => <button key={decade} type="button" onClick={() => changeDecade(decade)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${selectedDecade === decade ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}>{decade}</button>)}</div>
      <div className="mt-4 flex flex-wrap gap-2">{years.map((year) => <button key={year} type="button" onClick={() => setSelectedYear(year)} className={`rounded-md px-3 py-1.5 text-sm font-medium ${selectedYear === year ? "bg-indigo-600 text-white" : "bg-white text-gray-700"}`}>{year}</button>)}</div>
      <div className="mt-8"><PageLayoutEditor pageKey={getHistoryPageKey(selectedYear)} title={`${selectedYear} history page`} notify={notify} /></div>
    </main>
  );
}
