import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import { motion } from "framer-motion";

const FertilizerSuggestion = () => {
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const [userInfo, setUserInfo] = useState(null);
    const [soilData, setSoilData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            setError(null);

            const user = auth.currentUser;
            if (!user) {
                setError('User not logged in.');
                setIsLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'farmers', user.uid));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data());
                } else {
                    setError('User data not found.');
                }
            } catch (err) {
                setError('Failed to fetch user data.');
                console.error('Error fetching user data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (userInfo && userInfo.district) {
            setSoilData({
                nitrogen: 40,
                phosphorus: 20,
                potassium: 10,
            });
        }
    }, [userInfo?.district]);

    const getCropStage = (sowingMonth, harvestingMonth) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const sowingMonthNum = new Date(Date.parse(sowingMonth + " 1, 2024")).getMonth();
        const harvestingMonthNum = new Date(Date.parse(harvestingMonth + " 1, 2024")).getMonth();
        const isSowingBeforeHarvesting = sowingMonthNum <= harvestingMonthNum;
        if (isSowingBeforeHarvesting) {
            if (currentMonth >= sowingMonthNum && currentMonth <= harvestingMonthNum) {
                return "Active growth stage";
            } else if (currentMonth < sowingMonthNum) {
                return "Pre-sowing stage";
            } else {
                return "Post-harvest stage";
            }
        } else {
            if (currentMonth >= sowingMonthNum || currentMonth <= harvestingMonthNum) {
                return "Active growth stage";
            } else if (currentMonth < sowingMonthNum && currentMonth > harvestingMonthNum) {
                return "Pre-sowing stage";
            } else {
                return "Post-harvest stage";
            }
        }
    };

    const prompt = useMemo(() => {
        if (!userInfo || !soilData) return '';
        const primaryCropStage = getCropStage("June", "December");
        const secondaryCropStage = getCropStage("October", "February");

        return `
            Provide fertilizer recommendations for ${userInfo.fullName || 'a farmer'} based on the following:
            **Farmer Profile:**
            - Age: ${userInfo.age || 'Unknown'}
            - Annual Income: ${userInfo.annualIncome || 'Unknown'}
            - District: ${userInfo.district || 'Unknown'}
            - Farming Experience: ${userInfo.farmingExperience || 'Unknown'} years
            - Gender: ${userInfo.gender || 'Unknown'}
            - Government Schemes: ${userInfo.governmentSchemes?.join(', ') || 'None'}
            - Has Smartphone: ${userInfo.hasSmartphone || 'Unknown'}
            - Irrigation Source: ${userInfo.irrigationSource || 'Unknown'}
            - Land Size: ${userInfo.landSize || 'Unknown'} ${userInfo.landUnit || 'Unknown'}
            - Organic Farming: ${userInfo.organicFarming || 'Unknown'}
            - Preferred Language: ${userInfo.preferredLanguage || 'Unknown'}
            - Primary Crop: ${userInfo.primaryCrop || 'Unknown'}
            - Secondary Crops: ${userInfo.secondaryCrops?.join(', ') || 'None'}
            - Soil Type: ${userInfo.soilType || 'Unknown'}
            - State: ${userInfo.state || 'Unknown'}
            - Village: ${userInfo.village || 'Unknown'}

            **Soil Analysis:**
            - Nitrogen (N): ${soilData.nitrogen} ppm
            - Phosphorus (P): ${soilData.phosphorus} ppm
            - Potassium (K): ${soilData.potassium} ppm

            **Crop Stages:**
            - Primary Crop Stage: ${primaryCropStage}
            - Secondary Crop Stage: ${secondaryCropStage}

            Provide specific fertilizer types, amounts, and application methods ,time interval , even specified for the current stage of the crop make sure to generate in the Preferred Language and there is no need to state every user attribute in the prompt only wats nessary.
        `;
    }, [userInfo, soilData]);

    const getFertilizerSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                }
            );
            const result = await response.json();
            const suggestionText = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No suggestion available.';
            setSuggestion(suggestionText);
        } catch (err) {
            setError('Failed to get fertilizer suggestion.');
            console.error('Error getting fertilizer suggestion:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-yellow-100 text-white p-4">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text text-3xl mt-6">
                Fertilizer Suggestion
            </h1>

            {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-lg text-gray-400">Loading...</p>
                </motion.div>
            )}
            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-red-500 text-lg">Error: {error}</p>
                </motion.div>
            )}

            {soilData && (
                <div className="w-full max-w-xl mx-auto">
                    <div className="bg-gray-100 p-4 rounded-md mb-4 text-black">
                        <h3 className="font-semibold mb-2">Soil NPK Values:</h3>
                        <p>Nitrogen (N): {soilData.nitrogen} ppm</p>
                        <p>Phosphorus (P): {soilData.phosphorus} ppm</p>
                        <p>Potassium (K): {soilData.potassium} ppm</p>
                    </div>
                    <motion.button
                        onClick={getFertilizerSuggestion}
                        className="bg-gradient-to-r from-orange-500 to-orange-900 py-2 px-3 rounded-md mx-auto block"
                        disabled={isLoading}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {isLoading ? "Generating Fertilizer Suggestion..." : "Get Fertilizer Suggestion"}
                    </motion.button>

                    {suggestion && (
                        <div className="mt-6">
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p {...props} className="text-black" />,
                                    h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold text-black" />,
                                    h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-semibold text-black" />,
                                    h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-medium text-black" />,
                                    h4: ({ node, ...props }) => <h4 {...props} className="text-base font-medium text-black" />,
                                    h5: ({ node, ...props }) => <h5 {...props} className="text-sm font-medium text-black" />,
                                    h6: ({ node, ...props }) => <h6 {...props} className="text-xs font-medium text-black" />,
                                    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside text-black" />,
                                    ol: ({ node, ...props }) => <ol {...props} className="list-decimal list-inside text-black" />,
                                    li: ({ node, ...props }) => <li {...props} className="text-black" />,
                                    blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-4 border-gray-300 pl-4 text-black" />,
                                    code: ({ node, inline, ...props }) =>
                                        inline ? (
                                            <code {...props} className="bg-gray-200 rounded-md p-1 text-black" />
                                        ) : (
                                            <code {...props} className="bg-gray-200 rounded-md p-2 block overflow-x-auto text-black" />
                                        ),
                                    a: ({ node, ...props }) => <a {...props} className="text-blue-500 underline" />,
                                    table: ({ node, ...props }) => <table {...props} className="table-auto text-black" />,
                                    thead: ({ node, ...props }) => <thead {...props} className="text-left" />,
                                    th: ({ node, ...props }) => <th {...props} className="border px-4 py-2" />,
                                    td: ({ node, ...props }) => <td {...props} className="border px-4 py-2" />,
                                    img: ({ node, ...props }) => <img {...props} className="max-w-full" />,
                                    strong: ({ node, ...props }) => <strong {...props} className="font-bold text-black" />,
                                    em: ({ node, ...props }) => <em {...props} className="italic text-black" />,
                                    del: ({ node, ...props }) => <del {...props} className="line-through text-black" />,
                                }}
                            >
                                {suggestion}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FertilizerSuggestion;