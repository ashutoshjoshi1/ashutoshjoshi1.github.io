'use client';

import CanvasLoader from "./components/common/CanvasLoader";
import ScrollMusicPlayer from "./components/common/ScrollMusicPlayer";
import ScrollWrapper from "./components/common/ScrollWrapper";
import Experience from "./components/experience";
import Footer from "./components/footer";
import Hero from "./components/hero";

const Home = () => {
  return (
    <CanvasLoader>
      <ScrollWrapper>
        <Hero/>
        <Experience/>
        <Footer/>
      </ScrollWrapper>
      <ScrollMusicPlayer />
    </CanvasLoader>
  );
};
export default Home;
