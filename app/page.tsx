import SmoothScroll from "./components/chrome/SmoothScroll";
import Nav from "./components/chrome/Nav";
import Footer from "./components/chrome/Footer";
import Reveals from "./components/motion/Reveals";
import Hero from "./components/hero/Hero";
import Inference from "./components/inference/Inference";
import Nasa from "./components/nasa/Nasa";
import Work from "./components/work/Work";
import Experience from "./components/experience/Experience";
import Lab from "./components/lab/Lab";
import Skills from "./components/skills/Skills";
import Ask from "./components/ask/Ask";
import Contact from "./components/contact/Contact";

export default function Home() {
  return (
    <SmoothScroll>
      <Nav />
      <main>
        {/* the window opens on the photograph, then the story slides over it */}
        <Hero />
        {/* the live KV-cache map holds while the inference story passes */}
        <Inference />
        <Nasa />
        <Work />
        <Experience />
        {/* the page's one change of ground */}
        <Lab />
        <Skills />
        <Ask />
        <Contact />
      </main>
      <Footer />
      <Reveals />
    </SmoothScroll>
  );
}
