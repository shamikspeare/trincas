import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';

import trincasImg from '../../assets/trincas-home.jpeg';
import otherRoomImg from '../../assets/other room-home.jpeg';
import mingImg from '../../assets/ming-home.jpeg';
import tavernImg from '../../assets/tavern-home.jpeg';
import mingHeaderImg from '../../assets/ming-header.png';
import tavernHeaderImg from '../../assets/tavern-header.png';
import trincasLogoImg from '../../assets/logo.png';

const framesBySlug = {
  'trincas': { heading: 'Trincas', img: trincasImg, titleImg: trincasLogoImg },
  'the-other-room': { heading: 'THE OTHER ROOM', img: otherRoomImg },
  'ming-room': { heading: 'Ming Room', img: mingImg, titleImg: mingHeaderImg },
  'tavern': { heading: 'Tavern', img: tavernImg, titleImg: tavernHeaderImg },
};

export default function DiningSubPage() {
  const { slug } = useParams();
  const frame = framesBySlug[slug];

  const title = frame?.heading || (slug ? slug.replace(/-/g, ' ') : 'Dining');

  return (
    <main className="w-full bg-white min-h-[60vh] flex flex-col">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Dining', link: '/dining' }, { label: title }]} />
      <div className="w-full flex flex-col pt-6 pb-12">
        <div className="mx-auto max-w-4xl p-6 text-center">
          {/* Heading image (centered) when available, otherwise text heading */}
          {frame ? (
            frame.titleImg ? (
              <img
                src={frame.titleImg}
                alt={title}
                className="mx-auto mb-6 object-contain"
                style={{ maxWidth: '80%', height: 'auto' }}
              />
            ) : (
              <h1 className="text-3xl font-semibold mb-4">{title}</h1>
            )
          ) : (
            <h1 className="text-3xl font-semibold mb-4">{title}</h1>
          )}

          {frame ? (
            <img src={frame.img} alt={title} className="w-full rounded-2xl object-cover" style={{ aspectRatio: '16/10' }} />
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center">No information available for this page.</div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <p>Details and descriptions for {title} can be managed from the admin dashboard.</p>
            <p className="mt-4">This page is a simple static subpage that mirrors the Dining listing.</p>
          </div>

          <div className="mt-6">
            <Link to="/dining" className="text-indigo-600 underline">Back to Dining</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
