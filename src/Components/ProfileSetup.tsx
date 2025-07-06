import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Save, MapPin, Tractor, Loader2, ArrowRight, IndianRupee } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { indianStates, cropTypes, soilTypes, irrigationSources } from '../utils/formOptions';
import { Loader } from '@googlemaps/js-api-loader';

interface FormData {
  fullName: string;
  age: string;
  gender: string;
  mobileNumber: string;
  pincode: string;
  village: string;
  district: string;
  state: string;
  country: string;
  landSize: string;
  landUnit: string;
  primaryCrop: string;
  secondaryCrops: string[];
  soilType: string;
  irrigationSource: string;
  annualIncome: string;
  hasSmartphone: string;
  preferredLanguage: string;
  farmingExperience: string;
  organicFarming: string;
  governmentSchemes: string[];
  latitude?: number;
  longitude?: number;
}

function ProfileSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: profile?.fullName || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    mobileNumber: profile?.mobileNumber || '+91',
    pincode: profile?.pincode || '',
    village: profile?.village || '',
    district: profile?.district || '',
    state: profile?.state || '',
    country: profile?.country || '',
    landSize: profile?.landSize || '',
    landUnit: profile?.landUnit || 'acres',
    primaryCrop: profile?.primaryCrop || '',
    secondaryCrops: profile?.secondaryCrops || [],
    soilType: profile?.soilType || '',
    irrigationSource: profile?.irrigationSource || '',
    annualIncome: profile?.annualIncome || '',
    hasSmartphone: profile?.hasSmartphone || 'yes',
    preferredLanguage: profile?.preferredLanguage || 'English',
    farmingExperience: profile?.farmingExperience || '',
    organicFarming: profile?.organicFarming || 'no',
    governmentSchemes: profile?.governmentSchemes || [],
    latitude: profile?.latitude,
    longitude: profile?.longitude,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
        if (!auth.currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, 'farmers', auth.currentUser.uid));
            if (userDoc.exists()) {
                setFormData(userDoc.data() as FormData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data. Please try again.');
        } finally {
            setLoadingProfile(false);
        }
    };

    if (!profile) {
        fetchUserProfile();
    } else {
        setLoadingProfile(false);
    }
}, [profile]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => {
        const currentArray = prev[name as keyof FormData] as string[];
        return {
            ...prev,
            [name]: checked ? [...currentArray, value] : currentArray.filter((item) => item !== value),
        };
    });
};

const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value;
    setFormData((prev) => ({ ...prev, pincode }));

    if (pincode.length >= 3) { // Adjusted length check
        setLoadingLocation(true);
        try {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: "weekly"
            });

            const google = await loader.load();
            const geocoder = new google.maps.Geocoder();

            const response = await geocoder.geocode({
                address: pincode
            });

            if (response.results.length > 0) {
                const result = response.results[0];
                const { lat, lng } = result.geometry.location;

                // Extract address components
                let district = '';
                let state = '';
                let locality = '';
                let country = '';

                result.address_components.forEach((component) => {
                    if (component.types.includes('administrative_area_level_2')) {
                        district = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                    if (component.types.includes('locality')) {
                        locality = component.long_name;
                    }
                    if (component.types.includes('country')) {
                        country = component.long_name;
                    }
                });

                setFormData((prev) => ({
                    ...prev,
                    latitude: lat(),
                    longitude: lng(),
                    district: district, 
                    state: state,      
                    village: locality,
                    country: country,
                }));

                toast.success('Location details updated successfully');
            } else {
                toast.error('Could not find location for this pincode');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            toast.error('Failed to fetch location details');
        } finally {
            setLoadingLocation(false);
        }
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('You must be logged in to save your profile');
      return;
    }

    try {
      setLoading(true);
      await setDoc(doc(db, 'farmers', auth.currentUser.uid), {
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Profile saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.fullName || !formData.mobileNumber || !formData.village || !formData.state)) {
      toast.error('Please fill all required fields');
      return;
    }
    if (currentStep === 2 && (!formData.primaryCrop || !formData.soilType)) {
      toast.error('Please fill all required fields');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Farmer Profile Setup</h1>
            <p className="text-gray-600">Please provide your details to personalize your farming experience</p>
            <div className="flex justify-center mt-6">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div
                      className={`rounded-full h-10 w-10 flex items-center justify-center ${
                        currentStep >= step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`h-1 w-10 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
    {currentStep === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-green-600" />
                Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        required
                    />
                </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-600" />
                Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handlePincodeChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            required
                        />
                        {loadingLocation && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="animate-spin h-5 w-5 text-green-600" />
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village/Town <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District <span className="text-red-500">*</span>
                      </label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        required
                    >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                    </label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                </div>
            </div>
        </motion.div>
    )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Tractor className="mr-2 h-5 w-5 text-green-600" />
                  Farm Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Land Size</label>
                    <div className="flex">
                      <input
                        type="number"
                        name="landSize"
                        value={formData.landSize}
                        onChange={handleChange}
                        className="w-2/3 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                      <select
                        name="landUnit"
                        value={formData.landUnit}
                        onChange={handleChange}
                        className="w-1/3 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      >
                        <option value="acres">Acres</option>
                        <option value="hectares">Hectares</option>
                        <option value="bigha">Bigha</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Crop</label>
                    <select
                      name="primaryCrop"
                      value={formData.primaryCrop}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="">Select Primary Crop</option>
                      {cropTypes.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Crops (Select multiple if applicable)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cropTypes.map((crop) => (
                        <div key={crop} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`crop-${crop}`}
                            name="secondaryCrops"
                            value={crop}
                            checked={formData.secondaryCrops.includes(crop)}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`crop-${crop}`} className="ml-2 text-sm text-gray-700">
                            {crop}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                    <select
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="">Select Soil Type</option>
                      {soilTypes.map((soil) => (
                        <option key={soil} value={soil}>
                          {soil}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Source</label>
                    <select
                      name="irrigationSource"
                      value={formData.irrigationSource}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="">Select Irrigation Source</option>
                      {irrigationSources.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <IndianRupee className="mr-2 h-5 w-5 text-green-600" />
                  Additional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
                    <select
                      name="annualIncome"
                      value={formData.annualIncome}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="">Select Income Range</option>
                      <option value="below50k">Below ₹50,000</option>
                      <option value="50k-1lakh">₹50,000 - ₹1,00,000</option>
                      <option value="1lakh-3lakh">₹1,00,000 - ₹3,00,000</option>
                      <option value="3lakh-5lakh">₹3,00,000 - ₹5,00,000</option>
                      <option value="above5lakh">Above ₹5,00,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farming Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="farmingExperience"
                      value={formData.farmingExperience}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Do you practice organic farming?
                    </label>
                    <select
                      name="organicFarming"
                      value={formData.organicFarming}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="partial">Partially</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Odia">Odia</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Government Schemes Enrolled (Select all that apply)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'PM-KISAN',
                        'Soil Health Card',
                        'Pradhan Mantri Fasal Bima Yojana',
                        'Kisan Credit Card',
                        'National Mission for Sustainable Agriculture',
                        'Paramparagat Krishi Vikas Yojana',
                        'PM Krishi Sinchai Yojana',
                        'None',
                      ].map((scheme) => (
                        <div key={scheme} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`scheme-${scheme}`}
                            name="governmentSchemes"
                            value={scheme}
                            checked={formData.governmentSchemes.includes(scheme)}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`scheme-${scheme}`} className="ml-2 text-sm text-gray-700">
                            {scheme}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border bg-green-600 text-white rounded-lg hover:bg-gray-50 transition flex items-center"
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Previous
                </button>
              )}
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              )}
              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Save Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfileSetup;