import React, { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from "../firebase";
import ReactMarkdown from 'react-markdown';
import { ChevronDown, TrendingUp } from "lucide-react";

Chart.register(...registerables);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
        <motion.div
            className="border rounded-lg p-4 shadow-md bg-gray-800 text-gray-300 mb-4 transition-all duration-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center w-full text-lg font-semibold py-2"
            >
                {title}
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="transition-transform">
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && displayContent && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-sm overflow-hidden"
                    >
                        <ReactMarkdown>
                            {displayContent}
                        </ReactMarkdown>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PriceChart = ({ prices }) => {
    const [chartData, setChartData] = useState(null);
    useEffect(() => {
        if (prices && prices.length > 0) {
            const dates = prices.map(p => p.date);
            const values = prices.map(p => p.price);
            setChartData({
                labels: dates,
                datasets: [
                    {
                        label: 'Recent Prices (₹)',
                        data: values,
                        fill: false,
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        borderColor: 'rgba(56, 189, 248, 1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(56, 189, 248, 1)',
                        pointBorderColor: '#fff',
                        pointHoverRadius: 8,
                        pointHoverBackgroundColor: 'rgba(56, 189, 248, 1)',
                        lineTension: 0.3,
                    },
                ],
            });
        }
    }, [prices]);
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date',
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Price (₹)',
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.5)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
                position: 'bottom',
                labels: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(56, 189, 248, 1)',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        chartData ? (
            <motion.div
                className="bg-gray-800 rounded-lg p-4 shadow-md mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <TrendingUp className="mr-2 w-5 h-5 text-blue-400" />
                    Recent Price Trend
                </h3>
                <div className="h-[300px]"> {/* Set a fixed height for the chart */}
                    <Line data={chartData} options={options} />
                </div>
            </motion.div>
        ) : (
            <div className="bg-gray-800 rounded-lg p-4 shadow-md mb-4 text-gray-400">
                No recent price data available.
            </div>
        )
    );
};

async function getMarketInsights(primaryCrop, existingData) {
    try {
        if (!primaryCrop) {
            return { error: "Crop is required." };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
        const today = new Date().toISOString().split("T")[0];

        const prompt = `
      Provide comprehensive and actionable market insights for ${primaryCrop} in India, targeting farmers seeking to maximize their returns.  Use the following information to provide the best possible answer.
      
      Detailed Price Analysis: ${existingData.priceAnalysis}
      Price Trend Forecast: ${existingData.priceTrendForecast}
      Market Drivers: ${existingData.marketDrivers}
      Actionable Advice: ${existingData.actionableAdvice}
      Regional Demand Analysis: ${existingData.regionalDemandAnalysis}
      Government Support Opportunities: ${existingData.governmentSupport}
      Price Volatility Management: ${existingData.priceVolatilityManagement}
      Argo-Farm Suitability: ${existingData.argoFarmSuitability}
      Export Potential: ${existingData.exportPotential}
      Value-Added Processing: ${existingData.valueAddedProcessing}
      Future Outlook: ${existingData.futureOutlook}

      Include:
      1.  A summary of the information provided above.
      2. **Recent Price Data:** A comprehensive list of the last 5 recent prices with dates in JSON array format, up to the current date (${today}), highlighting significant fluctuations.  If fewer than 5 data points are available, provide all available data.
      3.  Return all available data from the context.

      Return the response in JSON format.  Do not include any markdown formatting. The entire response should be valid JSON.
      {
        "summary": "...",
        "priceAnalysis": ${JSON.stringify(existingData.priceAnalysis)},
        "priceTrendForecast": ${JSON.stringify(existingData.priceTrendForecast)},
        "marketDrivers": ${JSON.stringify(existingData.marketDrivers)},
        "actionableAdvice": ${JSON.stringify(existingData.actionableAdvice)},
        "regionalDemand": ${JSON.stringify(existingData.regionalDemandAnalysis)},
        "governmentSupport": ${JSON.stringify(existingData.governmentSupport)},
        "priceVolatilityManagement": ${JSON.stringify(existingData.priceVolatilityManagement)},
        "argoFarmSuitability": ${JSON.stringify(existingData.argoFarmSuitability)},
        "exportPotential": ${JSON.stringify(existingData.exportPotential)},
        "valueAddedProcessing": ${JSON.stringify(existingData.valueAddedProcessing)},
        "futureOutlook": ${JSON.stringify(existingData.futureOutlook)},
        "recentPrices": [{"date": "YYYY-MM-DD", "price": number}, ...]
      }
    `;

        const result = await model.generateContent(prompt);
        let responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!responseText) throw new Error("⚠️ Empty response from AI.");

        console.log("AI Response (Raw):", responseText);

        responseText = responseText.replace(/```json\n/g, '').replace(/```/g, '');

        try {
            const parsedResponse = JSON.parse(responseText);
            return parsedResponse;
        } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            return { error: "⚠️ AI Analysis Failed: Could not parse response." };
        }
    } catch (error) {
        console.error("Error getting market insights:", error);
        if (error instanceof Error) {
            return { error: `Error: ${error.message}` };
        }
        return { error: "Unable to generate market insights at this time." };
    }
}

function MarketInsights() {
    const [primaryCrops, setPrimaryCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [analysisResult, setAnalysisResult] = useState({});
    const navigate = useNavigate();
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    const existingData = {
        priceAnalysis: {
            currentEstimatedPrice: {
                range: "₹320 - ₹450 per quintal (depending on variety, sugar recovery rate, and location). Note: Prices can fluctuate significantly.",
                factors: "Sugar recovery rate, variety of sugarcane, cane quality, location, and demand-supply dynamics."
            },
            historicalPriceTrends: "Prices have generally fluctuated, influenced by monsoon performance, government policies (e.g., Fair and Remunerative Price - FRP), and global sugar prices. Price volatility is common. There's a seasonal peak related to harvest and crushing seasons.",
            factorsInfluencingPrices: "Sugar recovery percentage, demand from sugar mills, government policies (e.g., FRP), international sugar prices, weather conditions affecting yield, and transportation costs."
        },
        priceTrendForecast: {
            shortTermForecast: "Stable to Slightly Rising (over the next 3-6 months).",
            supportingAnalysis: "The forecast is based on expectations of stable domestic demand, the crushing season being well underway, and projected stable international sugar prices. However, any significant change in rainfall patterns or government intervention could impact this forecast. Monitor sugar recovery rates closely as they will be a significant driver. A possible surge in prices if a major sugar producing state experiences adverse weather can be possible. Overall expectations remain positive with possible upward adjustments."
        },
        marketDrivers: {
            supply: "Domestic sugarcane production (influenced by acreage, yield, and weather), carryover stocks from the previous year, and sugar production.",
            demand: "Demand from sugar mills, ethanol production, and other industrial uses, along with the impact of festivals and seasons.",
            weather: "Monsoon performance significantly impacts sugarcane yield and recovery rates. Drought or excess rainfall can negatively affect production.",
            governmentPolicies: "Fair and Remunerative Price (FRP) set by the central government, state advisory prices (SAP), export policies, import duties, and ethanol blending mandates significantly influence prices."
        },
        actionableAdvice: {
            optimalSellingTimes: "Sell immediately after harvest when sugar recovery rates are highest (generally early in the crushing season). Consider staggered harvesting to ensure a steady supply.",
            storageStrategies: "Proper storage is not typically applicable to farmers; however, ensure that your sugarcane reaches the sugar mills in optimal condition, as the price will be based on sugar recovery rates.",
            riskManagementTips: "Diversify by growing different sugarcane varieties to manage risks. Consider forward contracts with sugar mills to lock in prices. Stay informed about market trends and government policies. Utilize crop insurance schemes to protect against weather-related losses.",
            additionalTips: "Carefully consider fertilizer application and irrigation. Implement pest control and disease management. Choose sugarcane varieties that are suitable to your region. Understand the mill's cane payment cycle to ensure timely payment."
        },
        regionalDemandAnalysis: {
            highDemandAreas: "Maharashtra, Uttar Pradesh, Karnataka, and Tamil Nadu are major sugarcane-producing states with high demand due to the presence of numerous sugar mills. Demand can be seasonal, increasing during festive periods.",
            regionalTrends: "Demand is largely driven by the location of sugar mills. The demand may vary depending on the local sugar mills and the ongoing contracts."
        },
        governmentSupport: {
            schemes: "Fair and Remunerative Price (FRP) – A minimum price guaranteed by the government. Various state governments also offer State Advisory Prices (SAP), which can be higher than FRP. Schemes to support the sugar industry like subsidies for ethanol production from sugarcane and interest subvention schemes. Crop insurance under the Pradhan Mantri Fasal Bima Yojana (PMFBY). Subsidies for irrigation and the use of bio-fertilizers.",
            howToLeverage: "Stay updated on government notifications and announcements. Register for relevant schemes through your local agricultural department. Ensure compliance with the required documentation. Partner with local extension services."
        },
        priceVolatilityManagement: {
            strategies: "Forward contracts: Secure prices by contracting with sugar mills before harvest. Crop insurance: Mitigate losses from weather-related events. Diversification: Grow different crops along with sugarcane to spread risk. Market intelligence: Stay informed about market trends and adjust your strategy accordingly. Consider cooperative or farmer producer organisations (FPOs) to improve bargaining power."
        },
        argoFarmSuitability: {
            suitability: "Sugarcane can be suitable for high-value agro-farms, especially if integrated with other income streams like ethanol production, bagasse utilization (for generating power or creating biofuels), and co-products (molasses, press mud).",
            benefits: "Increased profitability through value addition. Diversification of income streams. Reduced waste through the use of co-products. Improved sustainability through integrated farming practices. Potential for carbon credits and other sustainable initiatives.",
            challenges: "Significant initial investment required. Specialized knowledge of value-added processing. Managing multiple income streams. Market volatility for byproducts. Ensuring consistent sugarcane supply and proper resource management."
        },
        exportPotential: {
            potential: "India has good export potential for sugar and related products, particularly when international prices are favorable. Export policies are dynamic, influenced by domestic supply and international market conditions. Sugar, molasses, and ethanol are the key products.",
            policies: "The government periodically announces export quotas and may provide export incentives. Import duties and export taxes are also in place, varying over time. Market-driven pricing is generally followed to make export profitable.",
            factors: "Global demand and pricing. International trade agreements. Government policies. Currency exchange rates. Logistics and infrastructure costs."
        },
        valueAddedProcessing: {
            opportunities: "Ethanol production: Enhance profitability via ethanol production. Processing molasses into various products. Bagasse utilization: Using the waste byproduct of sugarcane to generate power or create biofuels. Packaging and branding for products such as jaggery, gur, and other specialty sugar variants. Explore creating animal feed products using co-products such as press mud.",
            steps: "Conduct market research to identify opportunities. Invest in appropriate processing equipment. Obtain required licenses and certifications. Develop a strong marketing and distribution strategy. Ensure compliance with food safety regulations."
        },
        futureOutlook: {
            longTermTrends: "The long-term outlook for sugarcane is generally positive, driven by: Rising demand for sugar and ethanol. Increased government support for ethanol blending. Expansion of sugarcane cultivation areas. Technological advancements in sugarcane farming and processing. However, the industry faces challenges such as climate change, water scarcity, and price volatility. Sustainable practices, integrated farming, and value addition will play a critical role in ensuring the long-term viability of sugarcane farming. There are continued attempts to research high-yielding varieties to improve returns and to reduce production cost.",
            keyFactors: "Changes in government policies (e.g., ethanol mandates). Global sugar prices. Impact of climate change on production. Technological advancements. Sustainable farming practices. Consumer preferences."
        }
    };

    useEffect(() => {
        const fetchCrops = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("Fetching crops...");
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, "farmers", user.uid));
                    if (userDoc.exists()) {
                        const userInfo = userDoc.data();
                        if (userInfo.primaryCrop) {
                            setPrimaryCrops([userInfo.primaryCrop]);
                        } else {
                            setError("No primary crop found for the user.");
                            toast.error('No primary crop found for the user.');
                        }

                    } else {
                        setError("User profile not found.");
                        toast.error('User profile not found.');
                    }
                }
                else {
                    setError("User is not logged in");
                    toast.error('User is not logged in.');
                }
            } catch (error) {
                console.error("Error fetching crops:", error);
                setError(error.message || "Failed to fetch crops.");
                toast.error('Failed to fetch crops. Please try again.');
            } finally {
                setLoading(false);
                console.log("Fetching crops completed.");
            }
        };
        fetchCrops();
    }, [navigate]);

    const handlePredict = useCallback(async (crop) => {
        setLoading(true);
        setError("");
        setAnalysisResult({});
        console.log(`Fetching market insights for ${crop}...`);
        try {
            const result = await getMarketInsights(crop, existingData);
            if (result.error) {
                setError(result.error);
                toast.error(result.error);
                if (result.error.includes("quota")) {
                    if (retryCount < MAX_RETRIES) {
                        setRetryCount(prevCount => prevCount + 1);
                        console.log(`Retrying after 5 seconds. Retry count: ${retryCount + 1}`);
                        setTimeout(() => handlePredict(crop), 5000);
                        return;
                    } else {
                        setError("Quota exceeded. Please try again later.");
                        toast.error("Quota exceeded. Please try again later.");
                    }
                }
            } else {
                setAnalysisResult(result);
                setRetryCount(0);
            }
        } catch (error) {
            setError("Failed to fetch market insights");
            console.error("Error fetching market insights", error);
            toast.error("Failed to fetch market insights");
        } finally {
            setLoading(false);
            console.log(`Fetching market insights for ${crop} completed.`);
        }
    }, [retryCount, MAX_RETRIES, existingData]);

    return (
        <div className="min-h-screen bg-yellow-100 text-white p-4">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text text-3xl mt-6">
                Market Insights
            </h1>
            <ToastContainer />

            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-lg text-gray-400">Loading...</p>
                </motion.div>
            )}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-red-500 text-lg">Error: {error}</p>
                </motion.div>
            )}

            {!loading && !error && primaryCrops.length > 0 && (
                <div className="w-full max-w-4xl mx-auto">
                    {primaryCrops.map((crop) => (
                        <div key={crop} className="mb-6">
                            <motion.button
                                onClick={() => handlePredict(crop)}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg"
                                disabled={loading}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {loading ? `Analyzing ${crop}...` : `Get Market Insights for ${crop}`}
                            </motion.button>

                            {analysisResult && Object.keys(analysisResult).length > 0 && (
                                <div className="mt-6">
                                    <PriceChart prices={analysisResult.recentPrices || []} />
                                    <AnimatePresence>
                                        {Object.entries(analysisResult)
                                            .filter(([, content]) => {
                                                if (typeof content === "string") {
                                                    return content.trim() !== "";
                                                } else if (Array.isArray(content)) {
                                                    return content.length > 0;
                                                } else if (typeof content === "object" && content !== null) {
                                                    return Object.keys(content).length > 0;
                                                }
                                                return false;
                                            })
                                            .map(([category, content]) => {
                                                if (category === "recentPrices") return null;
                                                return (
                                                <CollapsibleCard key={category} title={category} content={content} />
                                            )})}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MarketInsights;