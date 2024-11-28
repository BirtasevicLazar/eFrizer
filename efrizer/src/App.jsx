import React from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import './App.css';

// Layout komponente
import NewNavbar from './Components/NewNavbar/NewNavbar';
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
import Booking from './Components/Booking/Booking';
import Services from './Components/Services/Services';
import Pricing from './Components/Pricing/Pricing';
import About from './Components/About/About';
import Contact from './Components/Contact/Contact';

// Layout wrapper komponenta
const MainLayout = ({ children }) => (
  <>
    <NewNavbar />
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

// Dodajemo ScrollToTop wrapper
function ScrollToTopWrapper() {
  const { pathname } = useLocation();
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTopWrapper />
        <MainLayout><HomePage /></MainLayout>
      </>
    )
  },
  {
    path: "/register",
    element: (
      <>
        <ScrollToTopWrapper />
        <Register />
      </>
    )
  },
  {
    path: "/dashboard",
    element: <PrivateRoute><Dashboard /></PrivateRoute>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/booking/:slug",
    element: <Booking />
  },
  {
    path: "/services",
    element: (
      <>
        <ScrollToTopWrapper />
        <MainLayout><Services /></MainLayout>
      </>
    )
  },
  {
    path: "/pricing",
    element: (
      <>
        <ScrollToTopWrapper />
        <MainLayout><Pricing /></MainLayout>
      </>
    )
  },
  {
    path: "/about",
    element: (
      <>
        <ScrollToTopWrapper />
        <MainLayout><About /></MainLayout>
      </>
    )
  },
  {
    path: "/contact",
    element: (
      <>
        <ScrollToTopWrapper />
        <MainLayout><Contact /></MainLayout>
      </>
    )
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
