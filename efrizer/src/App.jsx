import React from 'react';
import './App.css';
import NavigationBar from './Components/Navbar/Navbar.jsx';
import Footer from './Components/Footer/Footer.jsx';
import Hero from './Components/Hero/Hero.jsx';
import Cards from './Components/PricingCards/Cards.jsx';
import './Style/typography.css';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <Hero />
      <Cards />
      <Footer />
    </div>
  );
}

export default App;
