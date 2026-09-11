import { formatImageBytes, formatImageResolution } from "../utils/processImage";

export default function ImageUploadSummaryMessage({ title, summary }) {
  if (!summary) return <span>{title}</span>;

  const originalSize = summary.original?.size || 0;
  const convertedSize = summary.converted?.size || 0;
  const savedBytes = Math.max(0, originalSize - convertedSize);
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return (
    <div className="flex flex-col gap-2 py-0.5 min-w-[280px]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-gray-900">{title}</span>
        {savedPercent > 0 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
            {savedPercent}% smaller
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50/90 p-2.5 text-xs">
        {/* Original File Details */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Original File</div>
          <div className="font-semibold text-gray-800">{summary.original.format || "Original"}</div>
          <div className="text-gray-600 font-medium">{formatImageBytes(originalSize)}</div>
          <div className="text-gray-500 text-[11px]">{formatImageResolution(summary.original)}</div>
        </div>

        {/* Converted File Details */}
        <div className="space-y-1 border-l border-gray-200 pl-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Converted File</div>
          <div className="font-semibold text-emerald-800">{summary.converted.format || "WEBP"}</div>
          <div className="font-bold text-emerald-700">{formatImageBytes(convertedSize)}</div>
          <div className="text-emerald-600 text-[11px]">{formatImageResolution(summary.converted)}</div>
        </div>
      </div>
    </div>
  );
}
