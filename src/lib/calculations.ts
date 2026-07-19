// Electricity tariff rates for Pakistan (approximate)
export const TARIFF_RATES = {
  // Per unit rates based on slabs (PKR)
  slabs: [
    { min: 0, max: 100, rate: 15.52 },
    { min: 101, max: 200, rate: 20.75 },
    { min: 201, max: 300, rate: 25.52 },
    { min: 301, max: 400, rate: 30.25 },
    { min: 401, max: 500, rate: 35.12 },
    { min: 501, max: 600, rate: 40.18 },
    { min: 601, max: 700, rate: 44.85 },
    { min: 701, max: Infinity, rate: 49.72 },
  ],
  // Additional charges
  fuelAdjustment: 4.15, // per unit
  salesTax: 17, // percentage
  tvFee: 35, // fixed
  duty: 1.5, // percentage
};

// Common appliances with their wattage
export const APPLIANCE_DATA = [
  { name: 'AC (1.5 Ton)', category: 'cooling', wattage: 1800, icon: 'Snowflake' },
  { name: 'AC (1 Ton)', category: 'cooling', wattage: 1200, icon: 'Snowflake' },
  { name: 'Ceiling Fan', category: 'cooling', wattage: 80, icon: 'Fan' },
  { name: 'Refrigerator', category: 'kitchen', wattage: 150, icon: 'Refrigerator' },
  { name: 'Iron', category: 'laundry', wattage: 1000, icon: 'Shirt' },
  { name: 'Washing Machine', category: 'laundry', wattage: 500, icon: 'WashingMachine' },
  { name: 'Water Motor', category: 'utilities', wattage: 750, icon: 'Droplets' },
  { name: 'LED Bulb (9W)', category: 'lighting', wattage: 9, icon: 'Lightbulb' },
  { name: 'LED Bulb (12W)', category: 'lighting', wattage: 12, icon: 'Lightbulb' },
  { name: 'Tube Light', category: 'lighting', wattage: 40, icon: 'Lightbulb' },
  { name: 'TV (LED)', category: 'entertainment', wattage: 120, icon: 'Tv' },
  { name: 'Computer', category: 'entertainment', wattage: 250, icon: 'Monitor' },
  { name: 'Microwave', category: 'kitchen', wattage: 1200, icon: 'Microwave' },
  { name: 'Electric Geyser', category: 'heating', wattage: 3000, icon: 'Flame' },
  { name: 'Room Heater', category: 'heating', wattage: 1500, icon: 'Flame' },
];

// Calculate electricity cost based on units
export function calculateBillAmount(units: number): number {
  let totalCost = 0;
  let remainingUnits = units;

  for (const slab of TARIFF_RATES.slabs) {
    if (remainingUnits <= 0) break;

    const slabUnits = Math.min(
      remainingUnits,
      slab.max === Infinity ? remainingUnits : slab.max - slab.min + 1
    );

    if (units > slab.min) {
      const unitsInSlab = Math.min(
        remainingUnits,
        slab.max === Infinity ? remainingUnits : slab.max - slab.min
      );
      totalCost += unitsInSlab * slab.rate;
      remainingUnits -= unitsInSlab;
    }
  }

  // Add fuel adjustment
  totalCost += units * TARIFF_RATES.fuelAdjustment;

  // Add fixed charges
  totalCost += TARIFF_RATES.tvFee;

  // Add taxes
  totalCost += totalCost * (TARIFF_RATES.salesTax / 100);
  totalCost += totalCost * (TARIFF_RATES.duty / 100);

  return Math.round(totalCost);
}

// Calculate appliance consumption
export function calculateApplianceConsumption(
  wattage: number,
  hoursDaily: number,
  daysUsed: number = 30
): { units: number; cost: number } {
  // Units = (Wattage × Hours × Days) / 1000
  const units = (wattage * hoursDaily * daysUsed) / 1000;
  const cost = calculateBillAmount(units);
  return { units: Math.round(units * 100) / 100, cost };
}

// Predict next month's bill
export function predictNextMonthBill(
  bills: { units_consumed: number; amount: number; month: string; year: number }[]
): { predicted_units: number; predicted_amount: number; trend: 'up' | 'down' | 'stable' } {
  if (bills.length < 2) {
    return { predicted_units: 0, predicted_amount: 0, trend: 'stable' };
  }

  // Sort bills by date
  const sortedBills = [...bills].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getMonthNumber(a.month) - getMonthNumber(b.month);
  });

  // Calculate average growth rate
  const changes: number[] = [];
  for (let i = 1; i < sortedBills.length; i++) {
    const change = (sortedBills[i].units_consumed - sortedBills[i - 1].units_consumed) / sortedBills[i - 1].units_consumed;
    changes.push(change);
  }

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const lastBill = sortedBills[sortedBills.length - 1];

  const predictedUnits = Math.round(lastBill.units_consumed * (1 + avgChange));
  const predictedAmount = calculateBillAmount(predictedUnits);

  const trend = avgChange > 0.05 ? 'up' : avgChange < -0.05 ? 'down' : 'stable';

  return { predicted_units: predictedUnits, predicted_amount: predictedAmount, trend };
}

// Get month number from month name
function getMonthNumber(month: string): number {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.findIndex(m => m.toLowerCase() === month.toLowerCase()) || 0;
}

// Solar calculation
export function calculateSolarSystem(
  monthlyBill: number,
  roofSize?: number,
  _city?: string
): {
  system_kw: number;
  panels: number;
  estimated_cost: number;
  monthly_savings: number;
  payback_years: number;
  annual_generation: number;
} {
  // Calculate units from bill (reverse calculation)
  const units = estimateUnitsFromBill(monthlyBill);

  // System size calculation (1 kW produces ~120-150 units/month in Pakistan)
  const systemKw = Math.round((units / 130) * 10) / 10;

  // Number of panels (assuming 450W panels)
  const panels = Math.ceil((systemKw * 1000) / 450);

  // Estimated cost (approx 180,000 PKR per kW)
  const estimatedCost = systemKw * 180000;

  // Monthly savings
  const monthlySavings = monthlyBill * 0.8; // 80% offset

  // Payback period
  const annualSavings = monthlySavings * 12;
  const paybackYears = Math.round((estimatedCost / annualSavings) * 10) / 10;

  // Annual generation
  const annualGeneration = systemKw * 130 * 12;

  return {
    system_kw: systemKw,
    panels,
    estimated_cost: estimatedCost,
    monthly_savings: monthlySavings,
    payback_years: paybackYears,
    annual_generation: Math.round(annualGeneration),
  };
}

// Estimate units from bill amount
function estimateUnitsFromBill(amount: number): number {
  // Rough estimation
  if (amount < 2000) return Math.round(amount / 25);
  if (amount < 5000) return Math.round(amount / 28);
  if (amount < 10000) return Math.round(amount / 32);
  if (amount < 20000) return Math.round(amount / 35);
  return Math.round(amount / 38);
}

// Saving tips
export const SAVING_TIPS = [
  {
    title: 'Optimize AC Temperature',
    titleUrdu: 'AC کا درجہ حرارت بہتر بنائیں',
    description: 'Set your AC between 24-26°C. Each degree lower increases consumption by 6-8%.',
    descriptionUrdu: 'اپنے AC کو 24-26 ڈگری کے درمیان سیٹ کریں۔ ہر ڈگری کم ہونے پر بجلی کی کھپت 6-8% بڑھ جاتی ہے۔',
    potential_savings: 1200,
    category: 'cooling',
    icon: 'Thermometer',
  },
  {
    title: 'Use Ceiling Fans',
    titleUrdu: 'چھت کے پنکھے استعمال کریں',
    description: 'Use fans with AC to circulate cool air, allowing you to set AC 2-3°C higher.',
    descriptionUrdu: 'ٹھنڈی ہوا کو گردش کرنے کے لیے AC کے ساتھ پنکھے استعمال کریں، جس سے AC 2-3 ڈگری زیادہ رکھ سکتے ہیں۔',
    potential_savings: 800,
    category: 'cooling',
    icon: 'Fan',
  },
  {
    title: 'Switch to LED Bulbs',
    titleUrdu: 'LED بلب استعمال کریں',
    description: 'LED bulbs use 75% less energy than incandescent bulbs and last 25 times longer.',
    descriptionUrdu: 'LED بلب روایتی بلب سے 75% کم بجلی استعمال کرتے ہیں اور 25 گنا زیادہ چلتے ہیں۔',
    potential_savings: 500,
    category: 'lighting',
    icon: 'Lightbulb',
  },
  {
    title: 'Unplug Devices',
    titleUrdu: 'آلات کو پلگ سے نکالیں',
    description: 'Standby devices consume 5-10% of your electricity. Unplug when not in use.',
    descriptionUrdu: 'غیر استعمال شدہ آلات 5-10% بجلی استعمال کرتے ہیں۔ نہ استعمال کرتے وقت پلگ نکالیں۔',
    potential_savings: 400,
    category: 'general',
    icon: 'Plug',
  },
  {
    title: 'Efficient Refrigerator Use',
    titleUrdu: 'ریفریجریٹر کا موثر استعمال',
    description: 'Don\'t open refrigerator frequently. Let food cool before storing.',
    descriptionUrdu: 'ریفریجریٹر کو بار بار نہ کھولیں۔ کھانا ٹھنڈا ہونے کے بعد رکھیں۔',
    potential_savings: 300,
    category: 'kitchen',
    icon: 'Refrigerator',
  },
  {
    title: 'Use Iron Efficiently',
    titleUrdu: 'استری کا موثر استعمال',
    description: 'Iron all clothes at once. Iron thick clothes first while iron is heating up.',
    descriptionUrdu: 'سارے کپڑوں کو ایک ساتھ استری کریں۔ گرم ہونے پر موٹے کپڑے پہلے استری کریں۔',
    potential_savings: 200,
    category: 'laundry',
    icon: 'Shirt',
  },
  {
    title: 'Optimize Water Pump',
    titleUrdu: 'پانی کی موٹر کی اصلاح',
    description: 'Use water pump during off-peak hours. Check for leaks to avoid wastage.',
    descriptionUrdu: 'پانی کی موٹر آف-پیاک اوقات میں استعمال کریں۔ رسیاؤ سے بچنے کے لیے لیکیج چیک کریں۔',
    potential_savings: 350,
    category: 'utilities',
    icon: 'Droplets',
  },
  {
    title: 'Solar Water Heater',
    titleUrdu: 'سولر واٹر ہیٹر',
    description: 'Install solar water heater to reduce geyser electricity consumption by 70%.',
    descriptionUrdu: 'سولر واٹر ہیٹر لگا کر گیس کی بجلی کی کھپت 70% کم کریں۔',
    potential_savings: 1500,
    category: 'heating',
    icon: 'Sun',
  },
];

// Pakistani cities with solar data
export const CITIES = [
  { name: 'Karachi', peak_sun_hours: 5.5, state: 'Sindh' },
  { name: 'Lahore', peak_sun_hours: 5.2, state: 'Punjab' },
  { name: 'Islamabad', peak_sun_hours: 5.3, state: 'Federal' },
  { name: 'Faisalabad', peak_sun_hours: 5.1, state: 'Punjab' },
  { name: 'Multan', peak_sun_hours: 5.4, state: 'Punjab' },
  { name: 'Peshawar', peak_sun_hours: 5.0, state: 'KP' },
  { name: 'Quetta', peak_sun_hours: 5.8, state: 'Balochistan' },
  { name: 'Hyderabad', peak_sun_hours: 5.6, state: 'Sindh' },
  { name: 'Rawalpindi', peak_sun_hours: 5.2, state: 'Punjab' },
  { name: 'Sialkot', peak_sun_hours: 5.0, state: 'Punjab' },
];
