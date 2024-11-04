import React from 'react';
import './App.css';
import NavigationBar from './Components/Navbar/Navbar.jsx';
import Footer from './Components/Footer/Footer.jsx';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <div className="App-hero">
        <header className="App-header">
          <h1>Finansijska infrastruktura za rast vaših prihoda</h1>
          <p>
            Pridružite se milionima kompanija svih veličina koje koriste Stripe za prihvatanje plaćanja online i uživo, ugrađivanje finansijskih usluga, pokretanje prilagođenih modela prihoda i izgradnju profitabilnijeg poslovanja.
          </p>
        </header>
      </div>
      <Footer />
    </div>
  );
}

export default App;
