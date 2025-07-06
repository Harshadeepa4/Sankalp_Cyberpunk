import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ChevronDown } from "lucide-react";

// Collapsible Card Component
const CollapsibleCard = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  let displayContent = "";

  if (typeof content === "string") {
    displayContent = content;
  } else if (Array.isArray(content)) {
    displayContent = content.map((item) => `- ${item}`).join("\n");
  } else if (typeof content === "object" && content !== null) {
    if (title === "treatmentRecommendations") {
      // Special handling for treatmentRecommendations
      displayContent = `**Chemical:** ${content.chemical}\n\n**Organic:** ${content.organic}`;
    } else {
      displayContent = JSON.stringify(content, null, 2); // Pretty print JSON
    }
  } else {
    displayContent = String(content);
  }

  return (
    <div className="border rounded-lg p-4 shadow-md bg-gray-800 text-gray-300 mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-lg font-semibold"
      >
        {title}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown />
        </motion.div>
      </button>
      {isOpen && displayContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 text-sm"
        >
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </motion.div>
      )}
    </div>
  );
};

function ImageAnalysis() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle File Selection
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle AI Prediction
  const handlePredict = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysisResult({});

    console.log("Starting prediction...");

    const user = auth.currentUser;
    if (!user) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "farmers", user.uid));
      if (!userDoc.exists()) {
        setError("User profile not found.");
        setLoading(false);
        return;
      }
      const userInfo = userDoc.data();
      console.log("User Data:", userInfo);

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result?.split(",")[1];
        if (!base64Data) {
          setError("Error processing image.");
          setLoading(false);
          return;
        }

        const imageParts = { inlineData: { mimeType: selectedFile.type, data: base64Data } };

        const prompt = `
          Analyze the provided plant leaf image and diagnose potential diseases.
          Provide structured recommendations for management.

          **Farmer Profile:**
          - Name: ${userInfo.fullName || "Unknown"}
          - Location: ${userInfo.state || "Not provided"}, ${userInfo.district || "Not provided"}
          - Primary Crop: ${userInfo.primaryCrop || "Not specified"}
          - Soil Type: ${userInfo.soilType || "Not specified"}
          - Irrigation Method: ${userInfo.irrigationSource || "Unknown"}

          Please provide the following information in a JSON format.
          Only return the JSON, do not include any other text.
          Do not include any disclaimers or introductory text.
          Ensure that the response is valid JSON.

          {
              "diseaseName": "",
              "symptoms": "",
              "possibleCauses": [],
              "treatmentRecommendations": {
                  "chemical": "",
                  "organic": ""
              },
              "preventiveMeasures": []
          }
        `;

        try {
          console.log("📤 Sending request to AI...");
          const result = await model.generateContent({
            contents: [{ parts: [{ text: prompt }, imageParts] }],
          });

          console.log("AI Response Received");
          const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!responseText) throw new Error("Empty response from AI.");

          console.log("AI Raw Output:", responseText);

          try {
            // Attempt to find the JSON within the response text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch && jsonMatch[0]) {
              const parsedResult = JSON.parse(jsonMatch[0]);
              console.log("Parsed AI Output:", parsedResult);
              setAnalysisResult(parsedResult);
            } else {
              throw new Error("Could not find valid JSON in response.");
            }
          } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            setError("AI Analysis Failed: Could not parse response.");
            setAnalysisResult({});
          }
        } catch (err) {
          setError("AI Analysis Failed.");
          console.error("AI Error:", err);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Failed to fetch user data.");
      console.error("Firestore Error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-gray-300 p-4" style={{
      backgroundImage: `url('/src/assets/bg.jpg')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <h2 className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text text-3xl mt-6">🌱 Detect Plant Disease from Image 🌱</h2>

      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-md text-center mt-6">
        <label className="block text-lg font-bold mb-2">Upload Plant Image</label>
        <input type="file" onChange={handleFileChange} accept="image/*" className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded mb-4" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border mb-4" />}
        <button onClick={handlePredict} className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md" disabled={loading}>{loading ? "Analyzing..." : "Predict"}</button>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {Object.keys(analysisResult).length > 0 && (
        <div className="bg-gray-800 p-6 mt-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-3xl">
          <h3 className="text-xl font-bold mb-3 text-center">🔍 AI Analysis Results</h3>
          {Object.entries(analysisResult).map(([category, content]) => (
            <CollapsibleCard key={category} title={category} content={content} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageAnalysis;