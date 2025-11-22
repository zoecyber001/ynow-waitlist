import React from 'react';
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
    </div>
  );
}

export default App;
