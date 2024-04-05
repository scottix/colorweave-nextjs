'use client'

import ColorPicker from "./components/ColorPicker";
import { type AnyColorType } from "./components/convert";

const Home = () => {
  return (
    <main className="mx-4 py-4 h-full">
      <ColorPicker />
    </main>
  );
}

export default Home;
