import React from 'react';
import './App.css';
import NavigationBar from './Components/Navbar/Navbar.jsx';

function App() {
  return (
    <div className="App">
      <NavigationBar />
      <div className="App-hero">
        <header className="App-header">
          <h1>Financial infrastructure to grow your revenue</h1>
          <p>
            Join the millions of companies of all sizes that use Stripe to accept payments online and in person, embed financial services, power custom revenue models, and build a more profitable business.
          </p>
        </header>
      </div>
    </div>
  );
}

export default App;
