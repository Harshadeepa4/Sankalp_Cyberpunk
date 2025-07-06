import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getCurrentWeather } from "../services/weatherService";
import { cropMoistureLevels, soilWaterCapacity, irrigationData } from "../utils/formOptions";

interface FarmerProfile {
  primaryCrop: string;
  soilType: string;
  irrigationSource: string;
  landSize: number;
  district?: string;
  state: string;
  village?: string;
}

const IrrigationControl: React.FC = () => {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [moistureData, setMoistureData] = useState<number | null>(null);
  const [irrigationTime, setIrrigationTime] = useState<string | null>(null);
  const [isIrrigationOn, setIsIrrigationOn] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  //Just for the mpv lets assume the value
  const soilDepthMeters = 0.07; // Default: 30cm, adjust based on crop root zone
  const evapotranspirationFactor = 0.1; // Rough estimate of water loss
  const defaultMoistureDeficit = 0; // Rough default, adjust as needed

  useEffect(() => {
    async function fetchProfileData() {
      if (!auth.currentUser) return;
      try {
        const userRef = doc(db, "farmers", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile(userDoc.data() as FarmerProfile);
        } else {
          console.error("User profile not found.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    fetchProfileData();
  }, []);

  useEffect(() => {
    async function fetchMoistureData() {
      if (!profile) return;

      const location = profile.district
        ? `${profile.district}, ${profile.state}, India`
        : `${profile.village}, ${profile.state}, India`;

      try {
        console.log("Fetching weather data for:", location);
        const weather = await getCurrentWeather(location);
        console.log("Weather data received:", weather);

        const estimatedMoisture = calculateSoilMoisture(weather.humidity, weather.rainfall);
        console.log("Estimated Moisture:", estimatedMoisture);

        setMoistureData(estimatedMoisture);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching moisture data:", error);
        setLoading(false);
      }
    }

    if (profile) fetchMoistureData();
  }, [profile]);

  function calculateSoilMoisture(humidity: string, rainfall: string): number {
    const baseMoisture = parseFloat(humidity.replace("%", "")) * 0.6;
    const rainfallEffect = parseFloat(rainfall.replace("mm", "")) * 2;
    return Math.min(baseMoisture + rainfallEffect, 100);
  }

  function calculateIrrigationTime() {
    if (!profile || moistureData === null) return;

    const { landSize, primaryCrop, soilType, irrigationSource } = profile;
    const idealMoisture = cropMoistureLevels[primaryCrop as keyof typeof cropMoistureLevels] || 60;
    const soilWaterHolding = soilWaterCapacity[soilType as keyof typeof soilWaterCapacity] || 0.5;
    const irrigationRate = irrigationData[irrigationSource as keyof typeof irrigationData]?.flowRate || 5;
    const irrigationEfficiency = irrigationData[irrigationSource as keyof typeof irrigationData]?.efficiency || 0.9;

    // Adjust moisture deficit, or use default.
    const moistureDeficit = Math.max(0, idealMoisture - (moistureData || (idealMoisture - defaultMoistureDeficit)));

    // Calculate required water in liters, considering evapotranspiration
    const landAreaMeters = landSize * 4047; // Acres to square meters
    const requiredWaterLiters =
      (moistureDeficit / 100) * soilWaterHolding * landAreaMeters * soilDepthMeters * 1000 * (1 + evapotranspirationFactor);

    const effectiveFlowRate = irrigationRate * irrigationEfficiency;
    const timeRequiredSeconds = requiredWaterLiters / effectiveFlowRate;
    const timeRequiredMinutes = timeRequiredSeconds / 60;

    setIrrigationTime(timeRequiredMinutes.toFixed(2));
  }

  useEffect(() => {
    if (moistureData !== null) {
      calculateIrrigationTime();
    }
  }, [moistureData]);

  const handleIrrigationToggle = () => {
    if (!isIrrigationOn) {
      if (irrigationTime) {
        const timeInSeconds = parseFloat(irrigationTime) * 60;
        setRemainingTime(timeInSeconds);
        setIsIrrigationOn(true);

        const interval = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev !== null && prev > 1) return prev - 1;
            clearInterval(interval);
            setIsIrrigationOn(false);
            return null;
          });
        }, 1000);
      }
    } else {
      setIsIrrigationOn(false);
      setRemainingTime(null);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Irrigation Control</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="mb-4 border border-gray-700 p-4 rounded">
            <h3 className="text-xl font-semibold">Profile Details</h3>
            <p><strong>Crop Type:</strong> {profile?.primaryCrop}</p>
            <p><strong>Soil Type:</strong> {profile?.soilType}</p>
            <p><strong>Irrigation Source:</strong> {profile?.irrigationSource}</p>
            <p><strong>Land Size:</strong> {profile?.landSize} acres</p>
          </div>

          <div className="mb-4 border border-gray-700 p-4 rounded">
            <h3 className="text-xl font-semibold">IoT-Based Farm Insights</h3>
            <p><strong>Optimal Moisture for {profile?.primaryCrop}:</strong> {cropMoistureLevels[profile?.primaryCrop as keyof typeof cropMoistureLevels] || 60}%</p>
            <p><strong>Soil Water Holding Capacity:</strong> {soilWaterCapacity[profile?.soilType as keyof typeof soilWaterCapacity] || 0.5} cm³/cm³</p>
            <p><strong>Water Flow Rate:</strong> {irrigationData[profile?.irrigationSource as keyof typeof irrigationData]?.flowRate || 5} L/s</p>
          </div>

          <div className="mb-4 border border-gray-700 p-4 rounded">
            <h3 className="text-xl font-semibold">Weather Conditions</h3>
            <p><strong>Humidity:</strong> {moistureData ? `${moistureData}%` : "N/A"}</p>
          </div>

          <h3 className="text-xl font-semibold">Recommended Irrigation Time</h3>
          <p>
            <strong>
              {irrigationTime
                ? parseFloat(irrigationTime) < 1
                  ? `${Math.round(parseFloat(irrigationTime) * 60)} seconds`
                  : `${irrigationTime} minutes`
                : "Calculating..."}
            </strong>
          </p>

          <button
            className={`mt-4 px-4 py-2 text-white rounded ${isIrrigationOn ? "bg-red-600" : "bg-green-600"}`}
            onClick={handleIrrigationToggle}
          >
            {isIrrigationOn
    ? remainingTime! < 60
        ? `Turn OFF Irrigation (${Math.floor(remainingTime!)} sec)`
        : `Turn OFF Irrigation (${Math.floor(remainingTime! / 60)}:${(Math.floor(remainingTime!) % 60).toString().padStart(2, "0")})`
    : "Turn ON Irrigation"}
          </button>
        </>
      )}
    </div>
  );
};

export default IrrigationControl;