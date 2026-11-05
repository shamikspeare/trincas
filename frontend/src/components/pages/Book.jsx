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
      setError(loadError.message || "Failed to load the blog posts");
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
        <Breadcrumb items={[{ label: "Home", link: "/" }, { label: "Book & Blog" }]} />

        <div className="w-full pt-6 pb-12">
          <div className="mx-auto max-w-4xl p-6">
            <h1 className="text-center font-serif text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-none text-gray-900">Book &amp; Blog</h1>

            <section className="mt-10 rounded-3xl bg-[#f3efe8] px-6 py-10 text-center sm:px-10">
              <h2 className="font-serif text-3xl text-gray-900 sm:text-4xl">Book</h2>
              <p className="mt-3 text-sm font-medium uppercase tracking-[0.22em] text-[#766b5e]">Coming Soon</p>
            </section>

            <section className="mt-12">
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#766b5e]">Blog</p>
                <h2 className="mt-2 font-serif text-3xl text-gray-900 sm:text-4xl">The Trincas Timeline Project</h2>
              </div>

              {loading ? (
                <div className="flex min-h-64 items-center justify-center text-gray-400">loading...</div>
              ) : error ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                  <p className="text-gray-500">Failed to load the blog posts.</p>
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
                <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                  Blog posts are coming soon.
                </div>
              ) : (
                <div className="mt-8 space-y-8">
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
                      <article key={section.id} className="prose max-w-none text-gray-800">
                        {section.heading ? <h3 className="mb-2 text-2xl font-semibold">{section.heading}</h3> : null}
                        {section.body ? (
                          <div
                            className="[&_a]:text-indigo-600 [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
                          />
                        ) : null}
                      </article>
                    )
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
