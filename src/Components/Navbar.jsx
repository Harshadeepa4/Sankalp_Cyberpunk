import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/logo.png";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [user, setUser] = useState(null); 

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleNavigation = (path, buttonName) => {
    if (location.pathname === path) {
      navigate("/");
      setActiveButton(null);
    } else {
      navigate(path);
      setActiveButton(buttonName);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">
          <div className="flex item-center flex-shrink-0">
            <img className="h-10 w-10 mr-2" src={logo} alt="logo" />
            <span className="text-x1 tracking-tight" style={{ fontSize: '1.75rem', lineHeight: '2.50rem' }}>
              PlantCare
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex ml-14 space-x-12">
            <li><button onClick={() => handleNavigation("/", "home")} className="hover:text-gray-600">Home</button></li>
            <li><button onClick={() => handleNavigation("/Service", "features")} className="hover:text-gray-600">Services</button></li>
            <li><button onClick={() => handleNavigation("/notifications", "notifications")} className="hover:text-gray-600">Notifications</button></li>
            <li><button onClick={() => handleNavigation("/about", "about")} className="hover:text-gray-600">About Us</button></li>
          </ul>

          {/* Right Side (Auth Buttons) */}
          <div className="hidden lg:flex justify-center space-x-12 items-center">
            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 border rounded-md"
              >
                Sign In
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-neutral-900 w-full p-12 flex-col justify-center item-center lg:hidden">
            <ul>
              <li className="py-4"><button onClick={() => handleNavigation("/", "home")} className="hover:text-gray-600">Home</button></li>
              <li className="py-4"><button onClick={() => handleNavigation("/features", "features")} className="hover:text-gray-600">Services</button></li>
              <li className="py-4"><button onClick={() => handleNavigation("/notifications", "notifications")} className="hover:text-gray-600">Notifications</button></li>
              <li className="py-4"><button onClick={() => handleNavigation("/about", "about")} className="hover:text-gray-600">About Us</button></li>
              {user && (
                <li className="py-4">
                  <button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md">
                    Dashboard
                  </button>
                </li>
              )}
            </ul>
            <div className="flex space-x-6">
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="py-2 px-3 bg-gradient-to-r from-orange-500 to-orange-900 rounded-md"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="py-2 px-3 bg-gray-600 rounded-md text-white"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
