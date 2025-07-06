# plantCare

## Introduction of Project

**Team Name:** CyberPunk  
**Team Leader:** Dhino Kevin B  
**Problem Statement:** Harvesting the Future: AI Solutions for Smallholder Farmers

**Summary:**  
plantCare is an AI-powered, multilingual, and sensor-integrated platform designed to support both experienced farmers and beginner teen farmers in India.

The project aims to reverse the declining farmer population by encouraging teen participation in farming alongside experienced farmers to maximize yield. It leverages AI and Google technologies to optimize crop yield and resource utilization. Key features include real-time irrigation control, disease detection, personalized advisory, market insights, and fertilizer recommendations.

The platform supports multiple languages, ensuring inclusivity for farmers across different regions. The sensor-driven approach allows for context-aware and personalized decision-making.

**Current Development Focus:**

- Emphasizing the implementation of core functional logic and intelligent AI features
- Prioritizing accuracy in data processing and actionable outputs
- Minimal but functional UI, designed primarily for testing and enabling interaction with core systems for the purpose of MVP

---

## Features of Project

- **Irrigation Optimization:** Integrates IoT and weather data to compute optimal irrigation levels for specific crops.
- **Image-Based Disease Detection:** Uses a machine learning model in combination with Gemini Vision API to identify and diagnose plant diseases from images.
- **Text Support:** Enables farmers to describe issues in text, which are auto-translated into their preferred language.
- **Voice Support:** Includes speech-to-text input and multilingual responses, ideal for farmers with low literacy levels.
- **Market Insights:** Uses Gemini to generate financial insights and mandi trends, visualized through Looker dashboards.
- **Fertilizer Recommendation:** Suggests the best fertilizer based on real-time values like NPK, humidity, crop type, etc., gathered through IoT sensors.

---

## Screenshot of Project

This section includes key snapshots of the web application:
![image](https://github.com/user-attachments/assets/5dad00a8-431e-43ee-a8cb-9bffde90d9d1)

---

## Installation and Setup

Follow the instructions below to run the project locally:

```bash
# Clone the repository
git clone https://github.com/CyberPunk-GDG/PlantCare

# Navigate to the project directory
cd plantCare

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Tech Stack

**Development:**  
- React  
- Tailwind CSS  
- Vite  
- REST APIs  
- Google IDX
- Flutter

**Google APIs and Tools:**  
- Gemini API  
- Google Maps API  
- Looker Studio  
- Google Sheets  
- Google IDX  

**Cloud & ML:**  
- Vertex AI  
- Firebase (Authentication, Firestore, Hosting)  

**Other APIs and Integrations:**  
- Pest Prophet API (Pest Forecasting)  
- Government Data API (MRIN – Mandi Prices)
- OpenWeather API

**IoT Integration:**  
- Sensors for NPK, humidity, temperature, and other environmental data

---

## Contributors

- [@dhinokevin](https://github.com/dhinokevin) – Team Lead  
- [@Harshadeepa4](https://github.com/Harshadeepa4)
- [@testgithubsonika](https://github.com/testgithubsonika)

---

## Acknowledgements

**Support Confirmed From:**

- Ministry of Agriculture, Government of India – For MRIN API access  
- Pest Prophet (USA) – For Pest Prediction API license for up to 10 locations

---

## Links

- GitHub Repository: https://github.com/CyberPunk-GDG/PlantCare 
- Github Flutter page: https://github.com/CyberPunk-GDG/merged
- MVP Demo Video (3 min): https://youtu.be/Go1V2sHkqdU?si=hZI9e0nectS60eDP
- Solution Pitch: https://www.youtube.com/watch?v=ZzPrNvY-CAI
- Live MVP Link: https://hosting-bfb24.web.app
- Process Flow Diagram: https://miro.com/app/board/uXjVIKVLusM=/?moveToWidget=3458764623248546182&cot=14

---

## Future Development

- Integration of real-time MRIN mandi prices using government data APIs  
- Expand Pest Prophet API support to cover wider regions  
- Extend support for additional regional languages  
- Collaborate with agri-tech companies and NGOs for on-ground deployment  
- Implement a built-in marketplace for affordable equipment and consumer-farmer interactions  
- Enable live consultations through Google Meet integration for expert assistance

---

## Outreach and Industry Collaboration

We have initiated collaborations with both government and international organizations to increase the impact and scalability of our solution.

- The Ministry of Agriculture (Govt. of India) has confirmed our access to the MRIN API via data.gov.in and advised coordination with IT leadership for deeper integration.
- Pest Prophet, a U.S.-based pest outbreak prediction company, has offered a free license for our non-commercial prototype.

These partnerships reflect the credibility and real-world applicability of the plantCare platform, aligning with the mission of the Google Solution Challenge.
](https://github.com/CyberPunk-GDG/GDG)
