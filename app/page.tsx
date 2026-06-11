import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import Work from "./components/Work";
import MissionLog from "./components/MissionLog";
import SpecSheet from "./components/SpecSheet";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <Preloader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Manifesto />
        <Work />
        <MissionLog />
        <SpecSheet />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
