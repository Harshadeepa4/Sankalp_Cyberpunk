import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    User, MapPin, Tractor, Droplets, Cloud, Thermometer, Wind,
    Sprout, Leaf, Calendar, Settings, LogOut, Edit,
    RefreshCw, CloudFog, ChevronDown, AlertTriangle, CheckCircle2,
    Sun, Moon, Cloud as CloudIcon, Umbrella, Snowflake, CloudLightning, BarChart3
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase'; // Import Firebase auth and db instances
import { getCurrentWeather } from '../services/weatherService'; // Import weather service function

// Interface for farmer profile data
interface Profile {
    gender: string;
    age: number;
    secondaryCrops: string[];
    fullName?: string;
    village?: string;
    state?: string;
    district?: string;
    landSize?: string;
    landUnit?: string;
    primaryCrop?: string;
    soilType?: string;
    irrigationSource?: string;
    governmentSchemes?: string[];
}

// Function to get weather icon component based on weather code
const getWeatherIcon = (iconCode: string) => {
    // Animation variants for weather icons
    const iconVariants = {
        hover: {
            scale: 1.2,
            rotate: [0, 10, -10, 0],
            transition: {
                duration: 0.5,
                ease: "easeInOut" // Use easeInOut for smoother animation
            }
        }
    };

    // Determine which icon to display based on the weather code
    const Icon = (() => {
        switch (iconCode) {
            case '01d': return <Sun className="w-24 h-24 text-yellow-400" />; // Sunny day
            case '01n': return <Moon className="w-24 h-24 text-gray-400" />;   // Clear night
            case '02d':
            case '02n':
            case '03d':
            case '03n':
            case '04d':
            case '04n': return <CloudIcon className="w-24 h-24 text-gray-500" />; // Cloudy day/night
            case '09d':
            case '09n':
            case '10d':
            case '10n': return <Umbrella className="w-24 h-24 text-blue-500" />; // Rainy day/night
            case '11d':
            case '11n': return <CloudLightning className="w-24 h-24 text-yellow-500" />; // Thunderstorm
            case '13d':
            case '13n': return <Snowflake className="w-24 h-24 text-blue-100" />; // Snow
            case '50d':
            case '50n': return <CloudFog className="w-24 h-24 text-gray-300" />;   // Fog
            default: return <CloudIcon className="w-24 h-24 text-gray-500" />;       // Default cloud icon
        }
    })();

    // Wrap the icon in a motion.div for hover animation
    return (
        <motion.div
            whileHover="hover" // Apply hover animation
            variants={iconVariants} // Use defined animation variants
        >
            {Icon}
        </motion.div>
    );
};

// Main Dashboard component
function Dashboard() {
    const navigate = useNavigate(); // Hook for programmatic navigation
    const [profile, setProfile] = useState<Profile | null>(null); // State for farmer profile data
    const [loading, setLoading] = useState(true);             // State for loading status of profile data
    const [expandedSection, setExpandedSection] = useState<string | null>(null); // State to manage expanded sections
    const [weather, setWeather] = useState({       // State for weather data
        temperature: '0°C',
        humidity: '65%',
        rainfall: '0mm',
        windSpeed: '12 km/h',
        description: 'Clear sky',
        icon: '01d'
    });
    const [loadingWeather, setLoadingWeather] = useState(false); // State for loading status of weather data
    const [error, setError] = useState<string | null>(null);       // State to store any error message

    // Fetch user profile data from Firestore
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!auth.currentUser) {
                // If no user is logged in, set loading to false and return
                setLoading(false);
                return;
            }

            try {
                // Get user document from Firestore
                const userDoc = await getDoc(doc(db, 'farmers', auth.currentUser.uid));
                if (userDoc.exists()) {
                    // If document exists, set the profile data
                    setProfile(userDoc.data() as Profile);
                } else {
                    // If document does not exist, show error and redirect to profile setup
                    toast.error('Please complete your profile setup');
                    navigate('/profile-setup');
                }
            } catch (error) {
                // Handle errors during fetching
                console.error('Error fetching profile:', error);
                toast.error('Failed to load profile data. Please try again.');
                setError("Failed to load profile."); // Set error state
            } finally {
                // Set loading to false after fetching (success or error)
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]); // Dependency on navigate

    // Fetch weather data based on user's location
    const fetchWeatherData = useCallback(async () => {
        // If district and village are not available, return
        if (!profile?.district && !profile?.village) return;
        const location = profile.district
            ? `${profile.district}, ${profile.state}, India` // Construct location string
            : `${profile.village}, ${profile.state}, India`;

        setLoadingWeather(true); // Set loading to true before fetching
        setError(null);       // Clear any previous errors
        try {
            // Fetch weather data using the weather service
            const weatherData = await getCurrentWeather(location);
            setWeather(weatherData); // Set the weather data
            toast.success('Weather data updated successfully'); // Show success message
        } catch (error) {
            // Handle errors during fetching
            console.error('Failed to fetch weather:', error);
            toast.error('Failed to fetch weather data. Please try again.');
            setError("Failed to load weather data."); // Set error message
        } finally {
            // Set loading to false after fetching
            setLoadingWeather(false);
        }
    }, [profile?.district, profile?.village, profile?.state]); // Dependencies for useCallback

    // Fetch weather data when profile changes
    useEffect(() => {
        if (profile) {
            fetchWeatherData();
        }
    }, [profile, fetchWeatherData]); // Dependency on profile and fetchWeatherData

    // Handle user logout
    const handleLogout = async () => {
        try {
            await signOut(auth); // Sign out using Firebase auth
            toast.success('Logged out successfully'); // Show success message
            navigate('/login');             // Navigate to login page
        } catch (error) {
            // Handle errors during logout
            console.error('Logout error:', error);
            toast.error('Failed to log out');
        }
    };

    // Handle edit profile navigation
    const handleEditProfile = () => {
        navigate('/profile-setup', { state: { profile } }); // Navigate to profile setup with current profile data
    };

    // Function to toggle expanded section
    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1], // Add scale animation for a pulsing effect
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut" // Use easeInOut for smoother animation
                    }}
                    className="rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"
                />
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-lg shadow-lg text-center"
                >
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()} // Reload the page on click
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        Retry
                    </button>
                </motion.div>
            </div>
        );
    }

    // Animation variants for cards
    const cardVariants = {
        hidden: { opacity: 0, y: 20 }, // Initial hidden state
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" // Use easeOut for a smoother entrance
            }
        },
        hover: {
            scale: 1.02, // Slight scale on hover
            transition: {
                duration: 0.2 // Short transition for hover effect
            }
        }
    };

    // Render the main dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            {/* Header section */}
            <motion.header
                initial={{ opacity: 0, y: -50 }} // Initial position
                animate={{ opacity: 1, y: 0 }}   // Animated position
                className="bg-white shadow-sm sticky top-0 z-50" // Sticky header
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        {/* App title with logo */}
                        <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }} // Slight scale on hover
                        >
                            <Sprout className="h-8 w-8 text-green-600 mr-3" />
                            <h1 className="text-xl font-bold text-gray-800">PlantCare</h1>
                        </motion.div>

                        {/* Edit profile and logout buttons */}
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }} // Rotate on hover
                                transition={{ duration: 0.3 }}
                                onClick={handleEditProfile}
                                className="p-2 text-gray-600 hover:text-green-600 transition"
                                title="Edit Profile"
                            >
                                <Settings className="h-5 w-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.1, x: 5 }} // Move right on hover
                                transition={{ duration: 0.3 }}
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-600 transition"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main content section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Section: Profile and Weather */}
                    <div className="space-y-6">
                        <motion.div
                            variants={cardVariants} // Use card animation variants
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="bg-white rounded-2xl shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Profile header with edit button */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <motion.h2
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xl font-semibold text-gray-800"
                                        >
                                            {profile?.fullName || 'Farmer'}
                                        </motion.h2>
                                        <p className="text-gray-600 text-sm">
                                            {profile?.village && profile?.state
                                                ? `${profile.village}, ${profile.state}`
                                                : 'Location not specified'}
                                        </p>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 15 }} // Rotate on hover
                                        onClick={handleEditProfile}
                                        className="p-2 text-gray-500 hover:text-green-600 transition"
                                        title="Edit Profile"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </motion.button>
                                </div>

                                {/* Profile information */}
                                <AnimatePresence>
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 space-y-4"
                                    >
                                        {[
                                            {
                                                icon: User,
                                                label: "Personal Info",
                                                value: profile?.gender && profile?.age
                                                    ? `${profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}, ${profile.age} years`
                                                    : 'Not specified'
                                            },
                                            {
                                                icon: MapPin,
                                                label: "Location",
                                                value: profile?.district
                                                    ? `${profile.district} District, ${profile?.state}`
                                                    : profile?.state || 'Not specified'
                                            },
                                            {
                                                icon: Tractor,
                                                label: "Farm Size",
                                                value: profile?.landSize
                                                    ? `${profile.landSize} ${profile.landUnit || 'acres'}`
                                                    : 'Not specified'
                                            },
                                            {
                                                icon: Sprout,
                                                label: "Primary Crop",
                                                value: profile?.primaryCrop || 'Not specified'
                                            },
                                            {
                                                icon: Droplets,
                                                label: "Irrigation",
                                                value: profile?.irrigationSource || 'Not specified'
                                            }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={item.label}
                                                initial={{ opacity: 0, x: -20 }} // Initial position
                                                animate={{ opacity: 1, x: 0 }}   // Animated position
                                                transition={{ delay: index * 0.1 }} // Staggered delay
                                                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <item.icon className="h-5 w-5 text-green-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                                                    <p className="text-sm text-gray-600">{item.value}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="bg-white rounded-2xl shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Weather card header with refresh button */}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Local Weather</h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 180 }}
                                        transition={{ duration: 0.5 }}
                                        onClick={fetchWeatherData} // Call fetchWeatherData on click
                                        className="text-blue-500 hover:text-blue-700 transition"
                                        disabled={loadingWeather} // Disable button while loading
                                    >
                                        <RefreshCw className={`h-5 w-5 ${loadingWeather ? 'animate-spin' : ''}`} />
                                    </motion.button>
                                </div>

                                {/* Weather information display */}
                                <motion.div
                                    className="flex flex-col items-center justify-center mb-6"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {getWeatherIcon(weather.icon)}
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-2xl font-semibold text-gray-800 mt-2 capitalize"
                                    >
                                        {weather.description}
                                    </motion.p>
                                    <p className="text-sm text-gray-600">
                                        {profile?.district
                                            ? `${profile.district}, ${profile?.state}`
                                            : profile?.state || 'Not specified'}
                                    </p>
                                </motion.div>

                                {/* Weather details grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { icon: Thermometer, label: "Temperature", value: weather.temperature },
                                        { icon: Droplets, label: "Humidity", value: weather.humidity },
                                        { icon: Wind, label: "Wind Speed", value: weather.windSpeed },
                                        { icon: Cloud, label: "Rainfall", value: weather.rainfall }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="flex flex-col items-center bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors"
                                        >
                                            <div className="bg-blue-100 rounded-full p-2 mb-2">
                                                <item.icon className="h-6 w-6 text-blue-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-700">{item.label}</p>
                                            <p className="text-xl font-bold text-blue-700">{item.value}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Section: Crop Calendar and Scheme */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="bg-white rounded-2xl shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Crop calendar header */}
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Crop Calendar</h2>
                                    <Calendar className="h-5 w-5 text-green-600" />
                                </div>

                                {/* Crop calendar table */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sowing</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvesting</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {/* Primary crop row */}
                                            {profile?.primaryCrop && (
                                                <motion.tr
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }} // Slight scale on hover
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Sprout className="h-4 w-4 text-green-500 mr-2" />
                                                            <span className="text-sm text-gray-800">{profile.primaryCrop}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">June - July</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">November - December</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            )}

                                            {/* Secondary crops rows (first 2) */}
                                            {profile?.secondaryCrops?.slice(0, 2).map((crop: string, index: number) => (
                                                <motion.tr
                                                    key={crop}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <Leaf className="h-4 w-4 text-green-500 mr-2" />
                                                            <span className="text-sm text-gray-800">{crop}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                        {index === 0 ? 'October - November' : 'February - March'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                        {index === 0 ? 'January - February' : 'May - June'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {index === 0 ? 'Planned' : 'Upcoming'}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}

                                            {/* No crops message */}
                                            {(!profile?.primaryCrop && (!profile?.secondaryCrops || profile.secondaryCrops.length === 0)) && (
                                                <tr>
                                                    
                                                        No crops added yet. Update your profile to see crop calendar.
                                                    
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="bg-white rounded-2xl shadow-md overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Government Schemes</h2>
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                </div>

                                <AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        {profile?.governmentSchemes && profile.governmentSchemes.length > 0 &&
                                            !profile.governmentSchemes.includes('None') ? (
                                            <>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-sm text-gray-600 mb-3"
                                                >
                                                    You are currently enrolled in the following schemes:
                                                </motion.p>

                                                <ul className="space-y-2">
                                                    {profile.governmentSchemes.map((scheme: string, index: number) => (
                                                        <motion.li
                                                            key={scheme}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700">{scheme}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                            <>
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-sm text-gray-600 mb-3"
                                                >
                                                    Recommended schemes based on your profile:
                                                </motion.p>

                                                <ul className="space-y-2">
                                                    {[
                                                        {
                                                            name: "PM-KISAN",
                                                            description: "Income support of ₹6,000 per year"
                                                        },
                                                        {
                                                            name: "Pradhan Mantri Fasal Bima Yojana",
                                                            description: "Crop insurance scheme"
                                                        },
                                                        {
                                                            name: "Kisan Credit Card",
                                                            description: "Easy access to credit for farmers"
                                                        }
                                                    ].map((scheme, index) => (
                                                        <motion.li
                                                            key={scheme.name}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="flex items-start p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                                                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <span className="text-sm font-medium text-gray-800">{scheme.name}</span>
                                                                <p className="text-xs text-gray-600">{scheme.description}</p>
                                                            </div>
                                                        </motion.li>
                                                    ))}
                                                </ul>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="mt-4"
                                                >
                                                    <button
                                                        onClick={handleEditProfile}
                                                        className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition transform hover:scale-105"
                                                    >
                                                        Update Enrolled Schemes
                                                    </button>
                                                </motion.div>
                                            </>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;