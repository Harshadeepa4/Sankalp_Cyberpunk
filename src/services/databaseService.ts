import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Farmer, CropData, WeatherAlert, MarketPrice } from '../utils/dbSchema';

// Farmer profile operations
export const createFarmerProfile = async (userId: string, farmerData: Partial<Farmer>) => {
  const farmerRef = doc(db, 'farmers', userId);
  
  await setDoc(farmerRef, {
    ...farmerData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return farmerRef.id;
};

export const updateFarmerProfile = async (userId: string, farmerData: Partial<Farmer>) => {
  const farmerRef = doc(db, 'farmers', userId);
  
  await updateDoc(farmerRef, {
    ...farmerData,
    updatedAt: serverTimestamp()
  });
  
  return farmerRef.id;
};

export const getFarmerProfile = async (userId: string) => {
  const farmerRef = doc(db, 'farmers', userId);
  const farmerDoc = await getDoc(farmerRef);
  
  if (farmerDoc.exists()) {
    return {
      id: farmerDoc.id,
      ...farmerDoc.data()
    };
  }
  
  return null;
};

// Crop data operations
export const addCropData = async (cropData: Partial<CropData>) => {
  const cropCollection = collection(db, 'cropData');
  
  const docRef = await addDoc(cropCollection, {
    ...cropData,
    priceUpdatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const getCropData = async (cropName: string) => {
  const cropCollection = collection(db, 'cropData');
  const cropQuery = query(cropCollection, where('cropName', '==', cropName));
  const querySnapshot = await getDocs(cropQuery);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  }
  
  return null;
};

export const getAllCrops = async () => {
  const cropCollection = collection(db, 'cropData');
  const querySnapshot = await getDocs(cropCollection);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Weather alert operations
export const addWeatherAlert = async (alertData: Partial<WeatherAlert>) => {
  const alertCollection = collection(db, 'weatherAlerts');
  
  const docRef = await addDoc(alertCollection, {
    ...alertData,
    createdAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const getActiveWeatherAlerts = async (state: string, district?: string) => {
  const alertCollection = collection(db, 'weatherAlerts');
  const now = Timestamp.now();
  
  let alertQuery;
  
  if (district) {
    alertQuery = query(
      alertCollection,
      where('affectedStates', 'array-contains', state),
      where('affectedDistricts', 'array-contains', district),
      where('endDate', '>=', now)
    );
  } else {
    alertQuery = query(
      alertCollection,
      where('affectedStates', 'array-contains', state),
      where('endDate', '>=', now)
    );
  }
  
  const querySnapshot = await getDocs(alertQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Market price operations
export const addMarketPrice = async (priceData: Partial<MarketPrice>) => {
  const priceCollection = collection(db, 'marketPrices');
  
  const docRef = await addDoc(priceCollection, {
    ...priceData,
    date: serverTimestamp()
  });
  
  return docRef.id;
};

export const getLatestMarketPrices = async (cropName: string, state?: string) => {
  const priceCollection = collection(db, 'marketPrices');
  
  let priceQuery;
  
  if (state) {
    priceQuery = query(
      priceCollection,
      where('cropName', '==', cropName),
      where('state', '==', state),
      orderBy('date', 'desc'),
      limit(5)
    );
  } else {
    priceQuery = query(
      priceCollection,
      where('cropName', '==', cropName),
      orderBy('date', 'desc'),
      limit(5)
    );
  }
  
  const querySnapshot = await getDocs(priceQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getMarketPricesByDistrict = async (district: string) => {
  const priceCollection = collection(db, 'marketPrices');
  const priceQuery = query(
    priceCollection,
    where('district', '==', district),
    orderBy('date', 'desc')
  );
  
  const querySnapshot = await getDocs(priceQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};