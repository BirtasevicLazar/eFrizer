import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout komponente
import NavigationBar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';

// Stranice i komponente
import Hero from './Components/Hero/Hero';
import Cards from './Components/PricingCards/Cards';
import FAQ from './Components/FAQ/FAQ';
import HowItWorks from './Components/HowItWorks/HowItWorks';
import Register from './Components/Register/Register';

// Layout wrapper komponenta
const MainLayout = ({ children }) => (
  <>
    <NavigationBar />
    {children}
    <Footer />
  </>
);

// Home page komponenta
const HomePage = () => (
  <>
    <Hero />
    <HowItWorks />
    <Cards />
    <FAQ />
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            } 
          />
          <Route 
            path="/register" 
            element={<Register />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
