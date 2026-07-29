import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import ThemeZone from "./components/ThemeZone";
import Manifesto from "./components/Manifesto";
import Telemetry from "./components/Telemetry";
import Systems from "./components/Systems";
import Work from "./components/Work";
import MissionLog from "./components/MissionLog";
import NeuralLab from "./components/NeuralLab";
import FlightRules from "./components/FlightRules";
import SpecSheet from "./components/SpecSheet";
import Interrogate from "./components/Interrogate";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        {/* the page inverts to paper while the mission statement holds the viewport */}
        <ThemeZone>
          <Manifesto />
          <Telemetry />
        </ThemeZone>
        {/* the day job — production ML at planetary scale */}
        <Systems />
        <Work />
        <MissionLog />
        {/* a real MLP trains live in the browser — the proof-of-skill centerpiece */}
        <NeuralLab />
        <FlightRules />
        <SpecSheet />
        {/* client-side RAG over the site's own corpus */}
        <Interrogate />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
