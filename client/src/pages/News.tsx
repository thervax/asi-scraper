import { useState, useEffect } from "react";

interface Article {
  category: string;
  title: string;
  url: string;
  author: string;
  image: string;
}

interface Issue {
  date: string;
  articles: Article[];
}

export default function News() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Laen artikleid...</div>
    );
  }

  if (error || issues.length === 0) {
    return (
      <div className="text-center py-10 text-red-500">
        Artiklite laadimine ebaõnnestus
      </div>
    );
  }

  const current = issues[selectedIndex];

  const grouped: Record<string, Article[]> = {};
  for (const article of current.articles) {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Sirp - Eesti kultuurileht</h1>
      <p className="text-gray-500 text-sm mb-6">
        Viimased väljaanded Sirp kultuurilehest
      </p>

      <div className="flex gap-2 mb-6">
        {issues.map((issue, i) => (
          <button
            key={issue.date}
            onClick={() => setSelectedIndex(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              i === selectedIndex
                ? "bg-slate-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {issue.date}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([category, articles]) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            {category}
          </h2>
          <div className="space-y-3">
            {articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-medium">{article.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{article.author}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
