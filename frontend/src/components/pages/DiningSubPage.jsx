import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import { supabase } from '../../lib/supabase';

import mingHeaderImg from '../../assets/ming-header.png';
import trincasLogoImg from '../../assets/logo.png';
import tavernHeaderImg from '../../assets/tavern-header.png';

// Same local title/logo mapping used on the Dining landing page —
// these stay local since they're custom transparent PNGs, not DB content.
function getDiningMetadata(slug, name) {
  switch (slug) {
    case 'trincas':
      return { titleImg: trincasLogoImg, titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' } };
    case 'the-other-room':
      return {
        heading: 'THE OTHER ROOM',
        headingStyle: {
          fontFamily: "'Times New Roman', Times, serif",
          fontWeight: 'bold',
        },
      };
    case 'ming-room':
      return { titleImg: mingHeaderImg, titleImgStyle: { height: 'clamp(5rem, 16vw, 8rem)' } };
    case 'tavern':
      return { titleImg: tavernHeaderImg, titleImgStyle: { height: 'clamp(3.5rem, 10vw, 5rem)' } };
    default:
      return { heading: name };
  }
}

export default function DiningSubPage() {
  const { slug } = useParams();
  const [room, setRoom] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch the room (name/slug) from `dining`
        const { data: roomData, error: roomError } = await supabase
          .from('dining')
          .select('*')
          .eq('slug', slug)
          .single();

        if (roomError) throw roomError;
        setRoom(roomData);

        // 2. Fetch all page sections, ordered by display_order
        const { data: sectionData, error: sectionError } = await supabase
          .from('dining_page_sections')
          .select('*')
          .eq('page_slug', slug)
          .order('display_order', { ascending: true });

        if (sectionError) throw sectionError;
        setSections(sectionData || []);
      } catch (err) {
        console.error('Error fetching dining page:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  const metadata = getDiningMetadata(slug, room?.name);
  const title = metadata.heading || room?.name || (slug ? slug.replace(/-/g, ' ') : 'Dining');

  if (loading) {
    return (
      <main className="w-full bg-white min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full bg-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Failed to load page.</p>
          <Link to="/dining" className="text-indigo-600 underline">Back to Dining</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-white min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Dining', link: '/dining' }, { label: title }]} />
      <div className="w-full flex flex-col pt-6 pb-12">
        <div className="mx-auto max-w-4xl p-6">
          {/* Header — stays top-center aligned */}
          <div className="text-center mb-8">
            {metadata.titleImg ? (
              <img
                src={metadata.titleImg}
                alt={title}
                className="mx-auto object-contain"
                style={metadata.titleImgStyle || { height: 'clamp(5rem, 14vw, 7rem)' }}
              />
            ) : (
              <h1
                className="text-3xl font-semibold"
                style={metadata.headingStyle}
              >
                {title}
              </h1>
            )}
          </div>

          {/* Sections stacked vertically with spacing */}
          <div className="space-y-8">
            {sections.length > 0 ? (
              sections.map((section) =>
                section.section_type === 'image' ? (
                  section.image_url ? (
                    <div key={section.id}>
                      <img
                        src={section.image_url}
                        alt={section.alt_text || ''}
                        className="w-full rounded-2xl object-cover"
                        style={{ aspectRatio: '16 / 10' }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : null
                ) : (
                  <div key={section.id} className="prose max-w-none text-gray-800">
                    {section.heading ? (
                      <h2 className="text-2xl font-semibold mb-2">{section.heading}</h2>
                    ) : null}
                    {section.body ? <p className="whitespace-pre-line">{section.body}</p> : null}
                  </div>
                )
              )
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
                No content available for this page yet.
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="mt-10 text-center">
            <Link to="/dining" className="text-indigo-600 underline">Back to Dining</Link>
          </div>
        </div>
      </div>
    </main>
  );
}