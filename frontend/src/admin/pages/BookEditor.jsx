import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import BookSectionsEditor from "../components/BookSectionsEditor";

function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed right-6 top-6 z-50 flex max-w-md items-start gap-3 rounded-xl border p-4 text-sm font-medium shadow-xl backdrop-blur-md ${
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

export default function BookEditor() {
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  function notify(type, message) {
    setToast({ type, message });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 sm:px-10">
      <AnimatePresence>{toast ? <Toast toast={toast} /> : null}</AnimatePresence>
      <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Books</h1>
      <p className="mt-1 text-base text-gray-500 sm:text-lg">
        Build the Books page with text and image sections in any order.
      </p>

      <div className="mt-8">
        <BookSectionsEditor notify={notify} />
      </div>
    </div>
  );
}
