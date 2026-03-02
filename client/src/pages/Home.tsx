import { Link } from "react-router";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Koidulauliku E-laulik</h1>
        <p className="text-gray-500">
          Tere tulemast! Siit leiad Eesti kultuuriartiklid ja üritused ühest
          kohast.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/artiklid"
          className="block p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Artiklid</h2>
          <p className="text-gray-500 text-sm">
            Viimased artiklid Sirp kultuurilehest
          </p>
        </Link>
        <Link
          to="/uritused"
          className="block p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Kultuuriüritused</h2>
          <p className="text-gray-500 text-sm">Üritused Tallinnas ja Tartus</p>
        </Link>
        <Link
          to="/esietendused"
          className="block p-6 bg-white border rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Esietendused</h2>
          <p className="text-gray-500 text-sm">
            Tulevased teatri esietendused
          </p>
        </Link>
      </div>
    </div>
  );
}
