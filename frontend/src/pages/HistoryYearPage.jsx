import React from "react";
import { useParams } from "react-router-dom";

export default function HistoryYearPage() {
  const { decade } = useParams();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <h1 className="text-4xl font-semibold text-gray-900">History of {decade}</h1>
    </div>
  );
}
