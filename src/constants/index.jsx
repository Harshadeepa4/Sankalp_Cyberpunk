import { BotMessageSquare } from "lucide-react";
import { PlugZap } from "lucide-react";
import {DatabaseBackup} from "lucide-react" 
import {MessageCircleQuestion} from "lucide-react"
import {ImageUp} from "lucide-react"
import {Tractor} from "lucide-react"
import {ShieldCheck} from "lucide-react"
import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Home", href: "#Home" },
  { label: "Features", href: "#Features" },
  { label: "About Us", href: "#" },
  { label: "How It Works", href: "#" },
];

export const testimonials = [
  {
    user: "Ravi Sharma",
    company: "Punjab",
    image: user1,
    text: "The expert visits have been a game-changer for my wheat crops. The AI-driven analysis and personalized support helped increase my yield significantly. Highly recommend for large-scale farmers!",
  },
  {
    user: "Aarti Patel",
    company: " Gujarat",
    image: user2,
    text: "The ₹99/month plan has been invaluable. The detailed analysis and fertilizer recommendations improved the health of my cotton fields. The personalized support is top-notch.",
  },
  {
    user: "Suresh Kumar",
    company: " Uttar Pradesh",
    image: user3,
    text: "The free tier has been incredibly useful for diagnosing issues with my vegetable crops. The cause analysis and preventive measures are straightforward and effective. Great tool for occasional users!",
  },
  {
    user: "Meena Reddy",
    company: " Karnataka",
    image: user4,
    text: "The Premium On-Site Model is worth every penny. The expert’s visit provided in-depth insights into my mango orchards, and the AI tools helped tailor the preventive measures perfectly.",
  },
  {
    user: "Harish Joshi",
    company: " Rajasthan",
    image: user5,
    text: "The free plan provided excellent disease predictions and actionable preventive measures. It's perfect for small-scale farmers like me who need reliable support without any cost.",
  },
  {
    user: "Sunita Ghoah",
    company: "West Bengal",
    image: user6,
    text: "With the Personalized Support plan, I’ve seen a remarkable improvement in my banana plantation. The detailed analysis and fertilizer suggestions have made a big difference. Ideal for commercial operations!",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "Real-Time AI Disease Prediction",
    description:
      "Upload plant images to receive real-time AI-driven predictions for various plant diseases, ensuring immediate insights.",
  },
  {
    icon: <DatabaseBackup />,
    text: "Comprehensive Disease Database",
    description:
      "Access a detailed database of plant diseases, symptoms, and treatment options, enhancing your agricultural knowledge.",
  },
  {
    icon: <ImageUp />,
    text: "Instant Disease Detection via Image Upload",
    description:
      "Farmers can capture and upload plant images directly from their devices to receive real-time AI-based disease predictions, simplifying diagnosis in the field.",
  },
  {
    icon: <Tractor />,
    text: "Disease Cause Analysis with Climate Insights",
    description:
      "Integrates local climate information to identify potential causes of plant diseases, aiding farmers in effective prevention and management.",
  },
  {
    icon: <PlugZap />,
    text: "AI-Driven Preventive Measures",
    description:
      "The AI suggests tailored preventive actions and treatment plans to help farmers effectively manage and cure identified plant diseases.",
  },
  {
    icon: <ShieldCheck />,
    text: "User Feedback and Support",
    description:
      "Provide feedback and get assistance through an integrated support system, ensuring continuous improvement and user satisfaction.",
  },
];

export const checklistItems = [
  {
    title: "Capture Plant Image",
    description:
      "Farmers take a clear photo of the affected plant using their device, capturing visible symptoms for accurate analysis.",
  },
  {
    title: "Upload and Analyze",
    description:
      "Upload the image to the platform, where AI algorithms immediately analyze it to identify potential plant diseases.",
  },
  {
    title: "Review Diagnosis and Causes",
    description:
      "Receive a detailed diagnosis of the disease, including possible causes influenced by current climatic conditions.",
  },
  {
    title: " Get Preventive Measures",
    description:
      "The AI suggests effective preventive actions and treatment plans to manage and cure the diagnosed plant disease.",
  },
];

export const pricingOptions = [
  {
    title: "Krishi Sathi",
    price: " ₹0",
    features: [
      "Disease Prediction",
      "Cause Analysis",
      "Preventive Measures",
      "Ideal for Occasional users",
    ],
  },
  {
    title: "Krishi Sahayata",
    price: " ₹99/month",
    features: [
      "Personalized Support:",
      "Detailed Analysis",
      "Fertilizer Recommendations",
      "Ideal for Commercial Farmers",
    ],
  },
  {
    title: "Krishi Pariganak",
    price: " ₹999/year",
    features: [
      "Expert Visits",
      "AI-Enhanced Yield Optimization",
      "Customized Preventive Measures",
      "Ideal for High-value Argo-Farms",
    ],
  },
];

export const resourcesLinks = [
  { href: "#", text: "Getting Started" },
  { href: "#", text: "Documentation" },
  { href: "#", text: "Tutorials" },
  { href: "#", text: "Contact Us" },
  { href: "#", text: "Community Forums" },
];

export const platformLinks = [
  { href: "#", text: "Features" },
  { href: "#", text: "Supported Devices" },
  { href: "#", text: "Technology" },
  { href: "#", text: "Solutions" },
  { href: "#", text: "Release Notes" },
];

export const communityLinks = [
  { href: "#", text: "Privacy Policy" },
  { href: "#", text: "Terms of Service" },
  { href: "#", text: "Cookie Policy" },
  { href: "#", text: "Disclaimer" },
  { href: "#", text: "Refund and Return Policy " },
];