export interface BPReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | '';
  notes?: string;
  imageUrl?: string;
}

export type BPCategory = 'optimal' | 'normal' | 'high-normal' | 'high' | 'crisis';

export interface BPCategoryInfo {
  category: BPCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  urgent?: boolean;
}

export function getBPCategory(systolic: number, diastolic: number): BPCategoryInfo {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'crisis',
      label: 'Hypertensive Crisis',
      color: 'text-white',
      bgColor: 'bg-red-600',
      borderColor: 'border-red-700',
      description: 'Seek urgent medical attention',
      urgent: true,
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'high',
      label: 'High (Hypertension)',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      description: 'Consult your healthcare provider',
    };
  }
  if (systolic >= 130 || diastolic >= 85) {
    return {
      category: 'high-normal',
      label: 'High-Normal',
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      description: 'Consider lifestyle changes',
    };
  }
  if (systolic >= 120 || diastolic >= 80) {
    return {
      category: 'normal',
      label: 'Normal',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      description: 'Good blood pressure',
    };
  }
  return {
    category: 'optimal',
    label: 'Optimal',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    description: 'Excellent blood pressure',
  };
}
