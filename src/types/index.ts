export interface Bill {
  id: string;
  consumer_name: string;
  consumer_id?: string;
  address?: string;
  month: string;
  year: number;
  units_consumed: number;
  previous_units?: number;
  current_units?: number;
  amount: number;
  taxes?: number;
  fuel_adjustment?: number;
  total_amount: number;
  due_date?: string;
  payment_status?: string;
  created_at?: string;
}

export interface Appliance {
  id: string;
  name: string;
  category: string;
  wattage: number;
  hours_daily: number;
  quantity: number;
  days_used: number;
  estimated_units?: number;
  estimated_cost?: number;
  created_at?: string;
}

export interface WapdaOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  opening_time?: string;
  closing_time?: string;
  created_at?: string;
}

export interface SolarCalculation {
  id: string;
  monthly_bill: number;
  roof_size?: number;
  city?: string;
  recommended_system_kw: number;
  estimated_cost: number;
  monthly_savings: number;
  payback_years: number;
  created_at?: string;
}

export interface SavingTip {
  title: string;
  titleUrdu: string;
  description: string;
  descriptionUrdu: string;
  potential_savings: number;
  category: string;
  icon: string;
}

export interface BillPrediction {
  predicted_units: number;
  predicted_amount: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}
