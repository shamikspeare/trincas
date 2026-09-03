import Breadcrumb from "../Breadcrumb";
import Footer from "../Footer";

export default function MusicLegacy() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Breadcrumb items={[{ label: "Home", link: "/" }, { label: "Music", link: "/music" }, { label: "Music Legacy" }]} />
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 text-center sm:px-6 lg:px-8">
        <h1
          className="text-black"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.1rem, 6vw, 4rem)",
            fontWeight: 600,
          }}
        >
          Music Legacy
        </h1>
        <p
          className="mx-auto mt-2 max-w-3xl text-[#2a2a2a]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.35rem, 4vw, 2.1rem)",
            lineHeight: 1.2,
          }}
        >
          Music Legacy: All the Artists from 1959 till now.
        </p>
      </section>
      <Footer />
    </main>
  );
}
