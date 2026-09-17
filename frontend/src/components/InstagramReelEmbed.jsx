import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { getInstagramShortcode } from "../lib/pageLayouts";

export default function InstagramReelEmbed({ url, className = "" }) {
  const shortcode = getInstagramShortcode(url);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!shortcode) {
    return null;
  }

  return (
    <div className={`relative w-full h-[460px] sm:h-[500px] overflow-hidden rounded-[16px] ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 animate-pulse rounded-[16px]" />
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gray-50 rounded-[16px] border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-3">Couldn't load this reel</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Watch on Instagram
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <iframe
          src={`https://www.instagram.com/reel/${shortcode}/embed/`}
          className={`h-full w-full border-0 overflow-hidden transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ overflow: "hidden" }}
          loading="lazy"
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Instagram reel"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
