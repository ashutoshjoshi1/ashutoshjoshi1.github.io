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
import Work from "./components/Work";
import MissionLog from "./components/MissionLog";
import FlightRules from "./components/FlightRules";
import SpecSheet from "./components/SpecSheet";
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
        <Work />
        <MissionLog />
        <FlightRules />
        <SpecSheet />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
