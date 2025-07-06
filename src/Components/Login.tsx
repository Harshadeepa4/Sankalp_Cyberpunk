import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Sprout, Phone, Loader2 } from 'lucide-react';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setupRecaptcha = async () => {
    try {
      if (window.recaptchaVerifier) {
        await window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA verified'),
        'expired-callback': () => {
          window.recaptchaVerifier = null;
          toast.error('Security check expired. Please try again.');
        }
      });
      
      await verifier.render();
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      throw new Error('Failed to initialize security check. Please refresh the page.');
    }
  };

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formattedNumber)) {
        throw new Error('Invalid phone number format. Please include country code (e.g., +1234567890)');
      }
      const verifier = await setupRecaptcha();
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      window.confirmationResult = confirmationResult;
      setShowOtpInput(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error('Phone login error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirmationResult) {
      toast.error('Please request OTP first');
      return;
    }
    
    try {
      setLoading(true);
      await window.confirmationResult.confirm(otp);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error('Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Failed to login with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-4"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
    >
       <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="text-center mb-8">
        <div className="inline-block">
      <img 
        src="https://i.ibb.co/WpdMJBdH/logo-removebg-preview.png" 
        alt="Plant" 
        className="h-20 w-20 mb-4 transition-transform duration-300 ease-in-out hover:scale-150"
      />
    </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to PlantCare</h1>
          <p className="text-gray-600">Login to access your farming dashboard</p>
        </div>

        {!showOtpInput ? (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  <span>Send OTP</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-4 w-full border border-gray-300 bg-white text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center space-x-2"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5 w-5"
            />
            <span>Sign in with Google</span>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Sprout className="h-4 w-4 text-green-600" />
          <span>Growing together, digitally</span>
        </div>
      </motion.div>
      <div id="recaptcha-container"></div>
    </div>

  );
}

export default Login;