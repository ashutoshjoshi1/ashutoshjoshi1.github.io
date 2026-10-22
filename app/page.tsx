import SmoothScroll from "./components/SmoothScroll";
import Reveals from "./components/motion/Reveals";
import Hero from "./components/hero/Hero";
import Inference from "./components/inference/Inference";

export default function Home() {
  return (
    <SmoothScroll>
      <main>
        <Hero />
        <Inference />
      </main>
      <Reveals />
    </SmoothScroll>
  );
}
