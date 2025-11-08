import React from 'react';

interface ImageGalleryProps {
  queries: string[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ queries, title }) => {
  if (!queries || queries.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="text-md font-semibold text-slate-300 mb-3">{title}</h4>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
        {queries.map((query, index) => (
          <div key={`${query}-${index}`} className="flex-shrink-0">
            <img
              src={`https://source.unsplash.com/featured/150x150/?${query}`}
              alt={query}
              className="w-32 h-32 object-cover rounded-lg bg-slate-700 border-2 border-slate-600 shadow-md hover:shadow-lg transition-shadow"
              loading="lazy"
            />
            <p className="text-center text-xs text-slate-400 mt-1 capitalize">{query.replace('-', ' ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
