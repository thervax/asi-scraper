import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import News from "./pages/News";
import Events from "./pages/Events";
import Premieres from "./pages/Premieres";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artiklid" element={<News />} />
          <Route path="/uritused" element={<Events />} />
          <Route path="/esietendused" element={<Premieres />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
