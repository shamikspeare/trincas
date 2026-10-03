import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Breadcrumb from "../Breadcrumb";
import Footer from "../Footer";
import { fetchBookSections } from "../../lib/bookSections";
import { sanitizeHtml } from "../../lib/sanitize";

export default function Book() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSections(await fetchBookSections());
    } catch (loadError) {
      setError(loadError.message || "Failed to load the Books page");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <main className="flex min-h-[60vh] w-full flex-col bg-white">
        <Breadcrumb items={[{ label: "Home", link: "/" }, { label: "Books" }]} />

        <div className="w-full pt-6 pb-12">
          <div className="mx-auto max-w-4xl p-6">
            <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900 sm:text-4xl">Books</h1>
            {loading ? (
              <div className="flex min-h-64 items-center justify-center text-gray-400">loading...</div>
            ) : error ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                <p className="text-gray-500">Failed to load the Books page.</p>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              </div>
            ) : sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                No content is available for this page yet.
              </div>
            ) : (
              <div className="space-y-8">
                {sections.map((section) => (
                  section.section_type === "image" ? (
                    section.image_url ? (
                      <div key={section.id}>
                        <img
                          src={section.image_url}
                          alt={section.alt_text || ""}
                          className="w-full rounded-2xl object-cover"
                          style={{ aspectRatio: "16 / 10" }}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : null
                  ) : (
                    <div key={section.id} className="prose max-w-none text-gray-800">
                      {section.heading ? <h2 className="mb-2 text-2xl font-semibold">{section.heading}</h2> : null}
                      {section.body ? (
                        <div
                          className="[&_a]:text-indigo-600 [&_a]:underline"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
                        />
                      ) : null}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
