import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './Components/Navbar';
import HeroSection from './Components/HeroSection';
import Pricing from './Components/Service';
import Footer from './Components/Footer';
import AboutUs from './Components/AboutUs';
import UserProfile from './Components/UserProfile';
import Services from './Components/Services';
import Service from './Components/Service';
import Notifications from './Components/Notifications';
import ImageAnalysis from './Components/ImageAnalysis';
import TextAnalysis from './Components/TextAnalysis';
import MarketInsights from './Components/MarketInsights';
import Irrigation from  './Components/Irrigation';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import ProfileSetup from './Components/ProfileSetup';
import SpeechComponent from './Components/SpeechComponent';
import FertilizerSuggestion from './Components/FertilizerSuggestion';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-center" />
      <Routes>
        {/* Home Page - Always Accessible */}
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto pt-20 px-6">
              <HeroSection />
              <Pricing />
              <Footer />
            </div>
          }
        />

        {/* Public Routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/service" element={<Service />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Protected Routes - Require Login */}
        <Route
          path="/image-analysis"
          element={<ProtectedRoute user={user}><ImageAnalysis /></ProtectedRoute>}
        />
        <Route
          path="/text-analysis"
          element={<ProtectedRoute user={user}><TextAnalysis /></ProtectedRoute>}
        />
        <Route
          path="/market-insights"
          element={<ProtectedRoute user={user}><MarketInsights /></ProtectedRoute>}
        />
        <Route
          path="/Irrigation"
          element={<ProtectedRoute user={user}><Irrigation /></ProtectedRoute>}
        />
        <Route
          path="/SpeechComponent"
          element={<ProtectedRoute user={user}><SpeechComponent/></ProtectedRoute>}
        />
        <Route
          path="/FertilizerSuggestion"
          element={<ProtectedRoute user={user}><FertilizerSuggestion/></ProtectedRoute>}
        />

        {/* Authentication Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/profile-setup" element={user ? <ProfileSetup /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

        {/* Catch-All Route for Unmatched Paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
