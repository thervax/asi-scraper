import { useState, useEffect } from "react";

interface EventItem {
  title: string;
  url: string;
  location: string;
  city: string;
  image: string;
  excerpt: string;
  startTime: number;
  endTime: number;
  isFree: boolean;
}

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [city, setCity] = useState("tallinn");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/events?city=${city}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [city]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return d.toLocaleDateString("et-EE", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp * 1000);
    return d.toLocaleTimeString("et-EE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // group events by date
  const grouped: Record<string, EventItem[]> = {};
  for (const event of events) {
    const dateKey = formatDate(event.startTime);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Kultuuriüritused</h1>
      <p className="text-gray-500 text-sm mb-6">
        Lähiaja üritused kultuurikava.ee andmetel
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCity("tallinn")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            city === "tallinn"
              ? "bg-slate-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tallinn
        </button>
        <button
          onClick={() => setCity("tartu")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            city === "tartu"
              ? "bg-slate-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tartu
        </button>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500">Laen üritusi...</div>
      )}

      {error && (
        <div className="text-center py-10 text-red-500">
          Ürituste laadimine ebaõnnestus
        </div>
      )}

      {!loading &&
        !error &&
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">
              {date}
            </h2>
            <div className="space-y-3">
              {items.map((event, i) => (
                <a
                  key={i}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-4 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                >
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(event.startTime)} &middot; {event.location}
                    </p>
                    {event.isFree && (
                      <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        Tasuta
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
