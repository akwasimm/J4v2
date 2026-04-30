import React from 'react';

export default function SectionTitle({ color, title }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`h-6 w-1.5 ${color}`}></div>
      <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h2>
    </div>
  );
}
