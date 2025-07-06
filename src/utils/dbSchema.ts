// This file describes the database schema for reference

/*
Collection: farmers
Document ID: User UID from Firebase Authentication
Fields:
  - userId: string (Firebase Auth UID)
  - fullName: string
  - age: number
  - gender: string ('male', 'female', 'other')
  - mobileNumber: string
  - village: string
  - district: string
  - state: string
  - landSize: number
  - landUnit: string ('acres', 'hectares', 'bigha')
  - primaryCrop: string
  - secondaryCrops: string[]
  - soilType: string
  - irrigationSource: string
  - annualIncome: string
  - hasSmartphone: string ('yes', 'no')
  - preferredLanguage: string
  - farmingExperience: number
  - organicFarming: string ('yes', 'no', 'partial')
  - governmentSchemes: string[]
  - createdAt: timestamp
  - updatedAt: timestamp
*/

/*
Collection: cropData
Document ID: Auto-generated
Fields:
  - cropName: string
  - sowingMonths: string[]
  - harvestingMonths: string[]
  - idealSoilTypes: string[]
  - waterRequirements: string
  - fertilizers: string[]
  - commonPests: string[]
  - diseaseManagement: string
  - averageYield: string
  - marketPrice: number
  - priceUpdatedAt: timestamp
*/

/*
Collection: weatherAlerts
Document ID: Auto-generated
Fields:
  - alertType: string ('rain', 'drought', 'frost', 'heatwave')
  - severity: string ('low', 'medium', 'high')
  - affectedStates: string[]
  - affectedDistricts: string[]
  - startDate: timestamp
  - endDate: timestamp
  - description: string
  - recommendations: string
  - createdAt: timestamp
*/

/*
Collection: marketPrices
Document ID: Auto-generated
Fields:
  - cropName: string
  - price: number
  - unit: string ('quintal', 'kg', 'ton')
  - market: string
  - state: string
  - district: string
  - date: timestamp
  - trend: string ('rising', 'falling', 'stable')
  - source: string
*/

export interface Farmer {
  userId: string;
  fullName: string;
  age?: number;
  gender?: string;
  mobileNumber: string;
  village: string;
  district?: string;
  state: string;
  landSize?: number;
  landUnit?: string;
  primaryCrop?: string;
  secondaryCrops?: string[];
  soilType?: string;
  irrigationSource?: string;
  annualIncome?: string;
  hasSmartphone?: string;
  preferredLanguage?: string;
  farmingExperience?: number;
  organicFarming?: string;
  governmentSchemes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CropData {
  cropName: string;
  sowingMonths: string[];
  harvestingMonths: string[];
  idealSoilTypes: string[];
  waterRequirements: string;
  fertilizers: string[];
  commonPests: string[];
  diseaseManagement: string;
  averageYield: string;
  marketPrice: number;
  priceUpdatedAt: Date;
}

export interface WeatherAlert {
  alertType: string;
  severity: string;
  affectedStates: string[];
  affectedDistricts: string[];
  startDate: Date;
  endDate: Date;
  description: string;
  recommendations: string;
  createdAt: Date;
}

export interface MarketPrice {
  cropName: string;
  price: number;
  unit: string;
  market: string;
  state: string;
  district: string;
  date: Date;
  trend: string;
  source: string;
}