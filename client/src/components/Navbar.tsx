import { Link, useLocation } from "react-router";

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path: string) =>
    `text-sm font-medium ${
      location.pathname === path
        ? "text-slate-900"
        : "text-gray-400 hover:text-gray-600"
    }`;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          E-laulik
        </Link>
        <div className="flex gap-6">
          <Link to="/artiklid" className={linkClass("/artiklid")}>
            Artiklid
          </Link>
          <Link to="/uritused" className={linkClass("/uritused")}>
            Üritused
          </Link>
          <Link to="/esietendused" className={linkClass("/esietendused")}>
            Esietendused
          </Link>
        </div>
      </div>
    </nav>
  );
}
