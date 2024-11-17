import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';

// Layout komponente
import NavigationBar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';

// Stranice i komponente
import Hero from './Components/Hero/Hero';
import Cards from './Components/PricingCards/Cards';
import FAQ from './Components/FAQ/FAQ';
import HowItWorks from './Components/HowItWorks/HowItWorks';
import Register from './Components/Register/Register';
import Dashboard from './Components/Dashboard/Dashboard';
import Login from './Components/Login/Login';

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout><HomePage /></MainLayout>
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>
  },
  {
    path: "/login",
    element: <Login />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
