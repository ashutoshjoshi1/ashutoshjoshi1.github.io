import SmoothScroll from "./components/SmoothScroll";
import AnnouncementBar from "./components/AnnouncementBar";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stack from "./components/Stack";
import Impact from "./components/Impact";
import Fleet from "./components/Fleet";
import Work from "./components/Work";
import Experience from "./components/Experience";
import NeuralLab from "./components/NeuralLab";
import Principles from "./components/Principles";
import Skills from "./components/Skills";
import Interrogate from "./components/Interrogate";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <SmoothScroll>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero />
        {/* pinned: the LLM serving story, told on a 3D panel stack */}
        <Stack />
        {/* the forest card pins while its numbers land… */}
        <Impact />
        {/* …then this grey sheet slides up over it and carries the rest */}
        <div className="sheet">
          <Fleet />
          <Work />
          <Experience />
          {/* the lab: a black card holding the live-training MLP */}
          <div className="frame-x">
            <div data-nav="dark" className="theme-dark overflow-hidden rounded-[22px] bg-black">
              <NeuralLab />
              <Principles />
            </div>
          </div>
          <Skills />
          {/* client-side retrieval over the site's own text */}
          <Interrogate />
          <Contact />
        </div>
      </main>
      <Footer />
    </SmoothScroll>
  );
}
