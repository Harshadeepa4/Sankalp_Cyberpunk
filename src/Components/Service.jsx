import React from 'react';
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Service = () => {
  const navigate = useNavigate();

  const pricingOptions = [
    {
      title: "Image Analysis",
      features: [
        "Disease Prediction",
        "Cause Analysis",
        "Preventive Measures",
        "Ideal for Occasional users"
      ],
      redirectPath: "/image-analysis"
    },
    {
      title: "Text Analysis",
      features: [
        "Personalized Support",
        "Detailed Analysis",
        "Fertilizer Recommendations",
        "Ideal for Commercial Farmers"
      ],
      redirectPath: "/text-analysis"
    },
    {
      title: "Market Insights",
      features: [
        "Regional demand trends",
        "Government support programs",
        "Price fluctuations",
        "Ideal for High-value Argo-Farms"
      ],
      redirectPath: "/market-insights"
    },
    {
      title: "Irrigation",
      features: [
        "Smart Scheduling",
        "Water Usage Optimization",
        "Soil Moisture Monitoring",
        "Ideal for Sustainable Farming"
      ],
      redirectPath: "/Irrigation"
    },
    {
      title: "Speech Support",
      features: [
        "Multi-language Voice Commands",
        "Real-time Voice Support",
        "Prevents Language Barrier",
        "Ideal for Hands-Free Farming Assistance"
      ],
      redirectPath: "/SpeechComponent"
    },
    {
      title: "Fertilizer Corner",
      features: [
        "Customized Fertilizer Recommendations",
            "Real-time NPK Monitoring (IoT Integration)",
            "Crop-Specific Application Plans",
            "Yield Improvement Strategies"
      ],
      redirectPath: "/FertilizerSuggestion"
    }
  ];

  const handleGetStartedClick = (redirectPath) => {
    navigate(redirectPath);
  };

  return (
    <div className="mt-20">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide">
        Services
      </h2>
      <div className="flex flex-wrap justify-center">
        {pricingOptions.map((option, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 p-2">
            <div className="p-10 border border-neutral-700 rounded-xl h-full flex flex-col items-center">
              <p className="text-4xl mb-8 text-center">{option.title}</p>
              <p className="mb-4 text-center">Features</p>
              <ul className="flex-grow">
                {option.features.map((feature, index) => (
                  <li key={index} className="mt-4 flex items-center">
                    <CheckCircle2 />
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStartedClick(option.redirectPath)}
                className="inline-flex justify-center items-center text-center w-full h-12 p-5 mt-8 tracking-tight text-xl hover:bg-orange-900 border border-orange-900 rounded-lg transition duration-200"
              >
                Use Tool
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Service;
