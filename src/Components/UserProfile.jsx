import React, { useState } from "react";
import axios from 'axios'; 


function UserProfile() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "male",
    mobileNumber: "",
    altContact: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    landSize: "",
    crops: "",
    soilType: "",
    irrigationMethod: "",
    annualIncome: "",
    experience: "",
    languages:[],
    aadhaar: "",
    pmKisan: false,
    cropInsurance: false,
    otherSchemes:[],
  });
  const [submissionReceived, setSubmissionReceived] = useState(false);

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const soilTypes = [
    "Alluvial",
    "Black",
    "Red",
    "Laterite",
    "Mountain",
    "Desert",
  ];
  const irrigationMethods = ["Canal", "Drip", "Borewell", "Rain-fed"];
  const incomeRanges = [
    "Less than 1 Lakh",
    "1-5 Lakhs",
    "5-10 Lakhs",
    "More than 10 Lakhs",
  ];
  const languages = [
    "Hindi",
    "English",
    "Kannada",
    "Tamil",
    "Telugu",
    "Marathi",
  ];
  const governmentSchemes = [
    "Soil Health Card",
    "National Food Security Mission",
    "Paramparagat Krishi Vikas Yojana",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "pmKisan" || name === "cropInsurance") {
        setFormData({ ...formData, [name]: checked });
      } else if (languages.includes(name) || governmentSchemes.includes(name)) {
        let updatedList = formData[
          name.includes(languages[0]) ? "languages" : "otherSchemes"
        ];
        if (checked) {
          updatedList = [...updatedList, name];
        } else {
          updatedList = updatedList.filter((item) => item !== name);
        }
        setFormData({
          ...formData,
          [name.includes(languages[0]) ? "languages" : "otherSchemes"]:
            updatedList,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setError("");
      setStep(step + 1);
    } else {
      setError("Please fill in all required fields.");
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
    setError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      try {
        const response = await axios.post('http://localhost:5000/api/profile', formData);
        console.log('Profile saved:', response.data);

        // Redirect to the profile display page
        window.location.href = `/profile/${response.data._id}`;
      } catch (error) {
        console.error('Error saving profile:', error);
        if (error.response) {
          console.error("Server responded with error:", error.response.data);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
        setError('Failed to save profile. Please try again.');
      }
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const [error, setError] = useState("");
  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return (
          formData.fullName &&
          formData.age &&
          formData.gender &&
          formData.mobileNumber
        );
      case 2:
        return (
          formData.village &&
          formData.district &&
          formData.state &&
          formData.pincode
        );
      case 3:
        return (
          formData.landSize &&
          formData.crops &&
          formData.soilType &&
          formData.irrigationMethod
        );
      case 4:
        return (
          formData.annualIncome &&
          formData.experience &&
          formData.languages.length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const ayuDarkStyle = {
    backgroundColor: "#151718",
    backgroundImage: "url('src/assets/background.png')", 
    color: "#f5fefd",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-sans-serif",
    padding: "20px",
    fontSize: "1.75rem",
  };

  const cardStyle = {
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    backgroundColor: "#000000",
    border: "2.0px solid #ff6d16",
    width: "80%",
    maxWidth: "600px",
    textAlign: "center",
    color: "#f5fefd",
  };

  const headingStyle = {
    marginBottom: "20px",
    color: "#f97316",
    fontSize: "1.2em",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #f97316",
    borderRadius: "14px",
    backgroundColor: "#000000",
    color: "#ffffff",
    fontSize: "0.5em",
  };

  const selectStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    border: "1px solid #f97316",
    borderRadius: "14px",
    backgroundColor: "#000000",
    color: "#cdd6f4",
    fontSize: "0.5em",
  };

  const buttonStyle = {
    background:
      "linear-gradient(to right, #f97316 var(--tw-gradient-from-position), #7c2d12 var(--tw-gradient-to-position))",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8em",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  if (submissionReceived) {
    return (
      <div style={ayuDarkStyle}>
        <div style={cardStyle}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "2px solid #5cb85c",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "20px auto",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5cb85c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 style={{ color: "#5cb85c", marginBottom: "10px" }}>
            Thank You!
          </h2>
          <p style={{ fontSize: "0.8em" }}>Your details are updated</p>
        </div>
      </div>
    );
  }

  return (
    <div style={ayuDarkStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>User Profile Setup</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "20px",
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                backgroundColor: step >= s ? "#f97316" : "#ffa756",
                color: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "0.8em",
              }}
            >
              {s}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {step === 1 && (
            <div>
              <h3>Personal Information</h3>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                style={inputStyle}
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="tel"
                name="mobileNumber"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="tel"
                name="altContact"
                placeholder="Alternative Contact"
                value={formData.altContact}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <h3>Location Details</h3>
              <input
                type="text"
                name="village"
                placeholder="Village"
                value={formData.village}
                onChange={handleChange}
                style={inputStyle}
              />
              <input
                type="text"
                name="district"
                placeholder="District"
                value={formData.district}
                onChange={handleChange}
                style={inputStyle}
              />
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          )}
          {step === 3 && (
            <div>
              <h3>Farm Details</h3>
              <input
                type="text"
                name="landSize"
                placeholder="Total Land Size (Acres/Hectares)"
                value={formData.landSize}
                onChange={handleChange}
                style={inputStyle}
              />

              <h3>Crops Grown</h3>
              <input
                type="text"
                name="crops"
                placeholder="Mention the crops grown"
                value={formData.crops}
                onChange={handleChange}
                style={inputStyle}
              />

              <select
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select Soil Type</option>
                {soilTypes.map((soilType) => (
                  <option key={soilType} value={soilType}>
                    {soilType}
                  </option>
                ))}
              </select>
              <select
                name="irrigationMethod"
                value={formData.irrigationMethod}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select Irrigation Method</option>
                {irrigationMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          )}
          {step === 4 && (
            <div>
              <h3>Additional Information</h3>
              <select
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select Annual Income Range</option>
                {incomeRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="experience"
                placeholder="Farming Experience (Years)"
                value={formData.experience}
                onChange={handleChange}
                style={inputStyle}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label>Preferred Languages:</label>
                {languages.map((language) => (
                  <label
                    key={language}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      name={language}
                      checked={formData.languages.includes(language)}
                      onChange={handleChange}
                    />
                    <span style={{ marginLeft: "5px", fontSize: "0.5em" }}>
                      {language}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div>
              <h3>Government Scheme Enrollment</h3>
              <input
                type="text"
                name="aadhaar"
                placeholder="Aadhaar Number (Optional)"
                value={formData.aadhaar}
                onChange={handleChange}
                style={inputStyle}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    name="pmKisan"
                    checked={formData.pmKisan}
                    onChange={handleChange}
                  />
                  <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>
                    PM-Kisan Enrollment
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    name="cropInsurance"
                    checked={formData.cropInsurance}
                    onChange={handleChange}
                  />
                  <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>
                    Crop Insurance
                  </span>
                </label>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label>Other Government Schemes:</label>
                {governmentSchemes.map((scheme) => (
                  <label
                    key={scheme}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      name={scheme}
                      checked={formData.otherSchemes.includes(scheme)}
                      onChange={handleChange}
                    />
                    <span style={{ marginLeft: "5px", fontSize: "0.6em" }}>
                      {scheme}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            {step > 1 && (
              <button type="button" onClick={handlePrev} style={buttonStyle}>
                Previous
              </button>
            )}
            {step < 5 && (
              <button type="button" onClick={handleNext} style={buttonStyle}>
                Next
              </button>
            )}
            {step === 5 && (
              <button type="submit" style={buttonStyle}>
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
      </div>
);
}

export default UserProfile;