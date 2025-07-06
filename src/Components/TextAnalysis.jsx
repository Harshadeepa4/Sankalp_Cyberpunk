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
    if (title === "recommendations") {
      displayContent = Object.entries(content)
        .map(([key, value]) => `**${key}:** ${value}`)
        .join("\n\n");
    } else {
      displayContent = JSON.stringify(content, null, 2);
    }
  } else {
    displayContent = String(content);
  }

  return (
    <div className="border rounded-lg p-4 shadow-md bg-gray-800/80 text-gray-300 mb-3 min-h-48">
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
  const [userInput, setUserInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle AI Prediction
  const handlePredict = async () => {
    if (!userInput) {
      setError("⚠️ Please ask your question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysisResult({});

    const user = auth.currentUser;
    if (!user) {
      setError("⚠️ User is not logged in.");
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "farmers", user.uid));
      if (!userDoc.exists()) {
        setError("⚠️ User profile not found.");
        setLoading(false);
        return;
      }
      const userInfo = userDoc.data();

      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });

      const prompt = `
        Provide agricultural support based on the following question:

        **Farmer Profile:**
        - Name: ${userInfo.fullName || "Unknown"}
        - Location: ${userInfo.state || "Not provided"}, ${userInfo.district || "Not provided"}
        - Primary Crop: ${userInfo.primaryCrop || "Not specified"}
        - Soil Type: ${userInfo.soilType || "Not specified"}
        - Irrigation Method: ${userInfo.irrigationSource || "Unknown"}

        **Question:**
        ${userInput}

        Please provide the response in a JSON format.
        {
            "summary": "",
            "recommendations": {
                "cropSuggestions": "",
                "soilManagement": "",
                "irrigationTips": "",
                "pestControl": ""
            },
            "additionalNotes": ""
        }
      `;

      console.log("📤 Sending request to AI...");
      const result = await model.generateContent(prompt);
      console.log("✅ AI Response Received");

      const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!responseText) throw new Error("⚠️ Empty response from AI.");

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        setAnalysisResult(parsedResult);
      } else {
        throw new Error("Could not find valid JSON in response.");
      }
    } catch (err) {
      setError("⚠️ AI Analysis Failed.");
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center text-gray-300 p-4"
      style={{
        backgroundImage: `url('/src/assets/bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <h2 className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text text-3xl mt-6">
        🌱 Ask Your Agricultural Question 🌱
      </h2>

      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-md text-center mt-6">
        <label className="block text-lg font-bold mb-2 text-3xl">Ask a question:</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-2 bg-gray-700 text-gray-300 border border-gray-600 rounded mb-4"
          rows="4"
        />
        <button
          onClick={handlePredict}
          className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md transition-transform transform hover:scale-105"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Get Support"}
        </button>
        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>

      {Object.keys(analysisResult).length > 0 && (
        <div className="bg-gray-800/90 p-6 mt-6 rounded-xl shadow-lg border border-gray-700 w-full max-w-4xl min-h-80">
          <h3 className="text-xl font-bold mb-3 text-center">🔍 AI Support Results</h3>
          {Object.entries(analysisResult)
            .filter(([_, content]) => content && (typeof content === "string" ? content.trim() !== "" : Object.keys(content).length > 0))
            .map(([category, content]) => (
              <CollapsibleCard key={category} title={category} content={content} />
            ))}
        </div>
      )}
    </div>
  );
}

export default ImageAnalysis;
