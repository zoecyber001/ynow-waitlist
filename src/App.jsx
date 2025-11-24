import React from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react"
import Hero from './sections/Hero';
import Features from './sections/Features';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="app">
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
      <SpeedInsights />
    </div>
  );
}

export default App;
