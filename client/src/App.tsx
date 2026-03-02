import { BrowserRouter, Routes, Route } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import News from "./pages/News";
import Events from "./pages/Events";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artiklid" element={<News />} />
          <Route path="/uritused" element={<Events />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
