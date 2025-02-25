// web/components/ui/QuoteCard.js
import React from 'react';

export default function QuoteCard({ quote, author }) {
  return (
    <div className="bg-gray-800 bg-opacity-60 rounded-lg border border-blue-500/20 p-4 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        <div className="text-blue-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        
        <div className="flex-1">
          <p className="text-gray-300 text-lg font-light italic leading-relaxed mb-4">
            {quote}
          </p>
        </div>
        
        <div className="mt-auto">
          <p className="text-blue-400 font-medium">
            — {author}
          </p>
        </div>
      </div>
    </div>
  );
}
