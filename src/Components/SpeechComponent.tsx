import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const SpeechComponent: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [responseText, setResponseText] = useState<string | null>(null);
    const [isGeminiLoading, setIsGeminiLoading] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const mediaStream = useRef<MediaStream | null>(null);
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isUserDataLoading, setIsUserDataLoading] = useState(false);
    const [userDataError, setUserDataError] = useState<string | null>(null);
    const [geminiError, setGeminiError] = useState<string | null>(null);

    interface Part {
        text?: string;
        inlineData?: {
            mimeType: string;
            data: string;
        };
    }

    useEffect(() => {
        const fetchUserData = async () => {
            setIsUserDataLoading(true);
            setUserDataError(null);

            const user = auth.currentUser;
            if (!user) {
                setUserDataError("⚠️ User is not logged in.");
                setIsUserDataLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "farmers", user.uid));
                if (!userDoc.exists()) {
                    setUserDataError("⚠️ User profile not found.");
                } else {
                    setUserInfo(userDoc.data());
                }
            } catch (err) {
                setUserDataError("⚠️ AI Analysis Failed.");
                console.error("❌ Error:", err);
            } finally {
                setIsUserDataLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const prompt = useMemo(() => {
        if (!userInfo) return "";
        return `
            Provide agricultural support based for the farmer mentioned below threw the following audio:

            **Farmer Profile:**
            - Name: ${userInfo.fullName || "Unknown"}
            - Location: ${userInfo.state || "Not provided"}, ${userInfo.district || "Not provided"}
            - Primary Crop: ${userInfo.primaryCrop || "Not specified"}
            - Soil Type: ${userInfo.soilType || "Not specified"}
            - Irrigation Method: ${userInfo.irrigationSource || "Unknown"}
            respond only when u can understand the audio or else ask them to re record it or upload from the device
        `;
    }, [userInfo]);

    useEffect(() => {
        return () => {
            if (audioBlob) {
                URL.revokeObjectURL(URL.createObjectURL(audioBlob));
            }
        };
    }, [audioBlob]);

    const startRecording = async () => {
        try {
            setResponseText(null);
            setAudioBlob(null);
            audioChunks.current = [];

            mediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: { noiseSuppression: true, echoCancellation: true },
            });
            mediaRecorder.current = new MediaRecorder(mediaStream.current, {
                mimeType: "audio/webm;codecs=opus",
                audioBitsPerSecond: 128000,
            });

            mediaRecorder.current.onstart = () => setIsRecording(true);
            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };
            mediaRecorder.current.onstop = () => {
                const audio = new Blob(audioChunks.current, { type: "audio/webm" });
                setAudioBlob(audio);
                audioChunks.current = [];

                mediaStream.current?.getTracks().forEach((track) => track.stop());
                mediaStream.current = null;
                setIsRecording(false);
            };
            mediaRecorder.current.start();
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current?.state === "recording") {
            mediaRecorder.current.stop();
        }
    };

    const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAudioBlob(file);
        }
    };

    const convertAudioToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "");
            reader.onerror = reject;
        });
    };

    const sendToGemini = async () => {
        if (!audioBlob || !prompt.trim()) {
            alert("Please enter a prompt and record or upload an audio file.");
            return;
        }

        setIsGeminiLoading(true);
        setResponseText(null);
        setGeminiError(null);

        try {
            const base64Audio = await convertAudioToBase64(audioBlob);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: "user",
                                parts: [
                                    { text: prompt },
                                    { inlineData: { mimeType: "audio/mpeg", data: base64Audio } },
                                ],
                            },
                        ],
                    }),
                }
            );

            const result = await response.json();
            const responseText = result?.candidates?.[0]?.content?.parts?.map((part: Part) => part.text).join(" ") || "No response from Gemini.";
            setResponseText(responseText);
        } catch (error) {
            console.error("Error sending to Gemini:", error);
            setGeminiError("Error processing your request.");
        } finally {
            setIsGeminiLoading(false);
        }
    };

    const audioURL = useMemo(() => (audioBlob ? URL.createObjectURL(audioBlob) : ""), [audioBlob]);

    return (
        <div className="flex flex-col items-center p-4 border rounded-lg shadow-md bg-gray-100 max-w-md mx-auto">
            <h2 className="text-lg text-black font-semibold mb-2">🎤 Speech Assistant</h2>

            <div className="flex gap-2">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-4 py-2 rounded-lg transition ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
                    disabled={isGeminiLoading}
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                <label className="px-4 py-2 border rounded-lg bg-white text-black cursor-pointer">
                    Upload Audio
                    <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>
            </div>
            {audioBlob && <audio src={audioURL} controls className="mt-4 w-full" />}
            {responseText && (
                <div className="mt-4 w-full">
                    <ReactMarkdown>{responseText}</ReactMarkdown>
                </div>
            )}
            {isGeminiLoading && <p>Loading...</p>}
            {geminiError && <p className="text-red-500">{geminiError}</p>}
            {isUserDataLoading && <p>Loading user data...</p>}
            {userDataError && <p className="text-red-500">{userDataError}</p>}
            <button
                onClick={sendToGemini}
                className="px-4 py-2 mt-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isGeminiLoading || !audioBlob}
            >
                Send to Gemini
            </button>
        </div>
    );
};

export default SpeechComponent;