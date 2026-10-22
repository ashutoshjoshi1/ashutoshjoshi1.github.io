import SmoothScroll from "./components/chrome/SmoothScroll";
import Nav from "./components/chrome/Nav";
import Footer from "./components/chrome/Footer";
import Reveals from "./components/motion/Reveals";
import Split from "./components/split/Split";
import Hero from "./components/hero/Hero";
import Inference from "./components/inference/Inference";
import Nasa from "./components/nasa/Nasa";
import Work from "./components/work/Work";
import Experience from "./components/experience/Experience";
import Letter from "./components/letter/Letter";
import Skills from "./components/skills/Skills";
import Ask from "./components/ask/Ask";
import Contact from "./components/contact/Contact";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        {/* the reading column scrolls while the stage beside it holds:
            the portrait, then the live server, then the sun over Goddard */}
        <Split>
          <Hero />
          <Inference />
          <Nasa />
        </Split>
        <Work />
        <Experience />
        <Letter />
        <Skills />
        <Ask />
        <Contact />
      </main>
      <Footer />
      <Reveals />
    </SmoothScroll>
  );
}
