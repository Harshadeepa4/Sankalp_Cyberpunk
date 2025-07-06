// ProfileDisplay.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './ProfileDisplay.module.css'; // Import the CSS module

function ProfileDisplay() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/profile/${id}`);
                setProfile(response.data);
                setEditedProfile(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching profile.');
                setLoading(false);
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, [id]);

    const handleEdit = () => {
        setIsEditing(true);
        console.log('handleEdit: isEditing set to', true);
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/profile/${id}`, editedProfile);
            setProfile(response.data);
            setIsEditing(false);
            console.log('handleSave: isEditing set to', false);
        } catch (err) {
            setError('Error updating profile.');
            console.error('Error updating profile:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile({ ...editedProfile, [name]: value });
        console.log('handleChange: editedProfile updated:', { ...editedProfile, [name]: value });
    };

    const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
    const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Mountain", "Desert"];
    const irrigationMethods = ["Canal", "Drip", "Borewell", "Rain-fed"];
    const incomeRanges = ["Below 50,000", "50,000 - 1,00,001 - 5,00,000", "Above 5,00,000"];
    const languages = ["Kannada", "Hindi", "English", "Telugu", "Tamil", "Malayalam", "Bengali"];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!profile) return <div>Profile not found.</div>;

    const renderField = (label, name, type = 'text', options = null) => {
        return (
            <div className={styles.formField}>
                <label className={styles.label}>{label}:</label>
                {options ? (
                    <select name={name} value={editedProfile[name] || ''} onChange={handleChange} disabled={!isEditing} className={styles.input}>
                        <option value="">Select</option>
                        {options.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                ) : (
                    <input type={type} name={name} value={editedProfile[name] || ''} onChange={handleChange} disabled={!isEditing} className={styles.input}/>
                )}
            </div>
        );
    };

    const renderCheckbox = (label, name) => {
        return (
            <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                    <input type="checkbox" name={name} checked={editedProfile[name] || false} onChange={(e) => setEditedProfile({ ...editedProfile, [name]: e.target.checked })} disabled={!isEditing} className={styles.checkboxInput}/>
                    {label}
                </label>
            </div>
        );
    };

    const renderMultiSelect = (label, name, options) => {
        return (
            <div className={styles.formField}>
                <label className={styles.label}>{label}:</label>
                <select multiple name={name} value={editedProfile[name] || []} onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                    setEditedProfile({ ...editedProfile, [name]: selectedOptions });
                }} disabled={!isEditing} className={styles.input}>
                    {options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h2>{isEditing ? 'Edit Profile' : 'Profile Details'}</h2>
            <div className={styles.formContainer}>
                <h3>Personal Information</h3>
                {renderField('Full Name', 'fullName')}
                {renderField('Age', 'age', 'number')}
                {renderField('Gender', 'gender', 'select', ['Male', 'Female', 'Other'])}
                {renderField('Mobile Number', 'mobileNumber', 'tel')}
                {renderField('Alternative Contact', 'altContact', 'tel')}

                <h3>Location Details</h3>
                {renderField('Village', 'village')}
                {renderField('District', 'district')}
                {renderField('State', 'state', 'select', indianStates)}
                {renderField('Pincode', 'pincode', 'text')}

                <h3>Farm Details</h3>
                {renderField('Total Land Size', 'landSize')}
                {renderField('Crops Grown', 'crops')}
                {renderField('Soil Type', 'soilType', 'select', soilTypes)}
                {renderField('Irrigation Method', 'irrigationMethod', 'select', irrigationMethods)}

                <h3>Additional Information</h3>
                {renderField('Annual Farm Income', 'annualIncome', 'select', incomeRanges)}
                {renderField('Farming Experience (Years)', 'experience', 'number')}
                {renderMultiSelect('Preferred Language', 'languages', languages)}

                <h3>Government Scheme Enrollment</h3>
                {renderField('Aadhaar Number', 'aadhaar')}
                {renderCheckbox('PM-Kisan Enrollment', 'pmKisan')}
                {renderCheckbox('Crop Insurance', 'cropInsurance')}
                {renderMultiSelect('Other Government Schemes', 'otherSchemes', ["Soil Health Card", "PM Fasal Bima Yojana", "Other"])}

                {isEditing ? (
                    <button onClick={handleSave} className={styles.button}>Save</button>
                ) : (
                    <button onClick={handleEdit} className={styles.button}>Edit</button>
                )}
            </div>
        </div>
    );
}

export default ProfileDisplay;