import { useState, useEffect } from "react";

interface Premiere {
  date: string;
  time: string;
  title: string;
  location: string;
  image: string;
  url: string;
}

export default function Premieres() {
  const [premieres, setPremieres] = useState<Premiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/premieres")
      .then((res) => res.json())
      .then((data) => {
        setPremieres(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Laen esietendusi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Esietenduste laadimine ebaõnnestus
      </div>
    );
  }

  const grouped: Record<string, Premiere[]> = {};
  for (const p of premieres) {
    if (!grouped[p.date]) {
      grouped[p.date] = [];
    }
    grouped[p.date].push(p);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Esietendused</h1>
      <p className="text-gray-500 text-sm mb-6">
        Tulevased esietendused teater.ee andmetel
      </p>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-8">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">{date}</h2>
          <div className="space-y-3">
            {items.map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.time}
                    {p.location && <> &middot; {p.location}</>}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
