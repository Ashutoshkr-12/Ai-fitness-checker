import React from 'react';
import { BmiCategory } from '../types';

interface BmiGaugeProps {
  bmi: number;
  category: BmiCategory;
}

const getNeedlePosition = (bmi: number): number => {
  // Clamp BMI to a visual range of 15-40
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  // Scale the BMI value to a percentage (0-100)
  const percentage = ((clampedBmi - 15) / (40 - 15)) * 100;
  return percentage;
};

export const BmiGauge: React.FC<BmiGaugeProps> = ({ bmi }) => {
  const needlePosition = getNeedlePosition(bmi);

  return (
    <div className="w-full max-w-md mx-auto mt-4 md:mt-0">
      <div className="relative h-6 w-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-full overflow-hidden border-2 border-slate-600">
         {/* Zones */}
         <div className="absolute top-0 left-0 h-full w-[14%]" style={{backgroundColor: 'rgba(37, 99, 235, 0.8)'}}></div>
         <div className="absolute top-0 left-[14%] h-full w-[26%]" style={{backgroundColor: 'rgba(34, 197, 94, 0.8)'}}></div>
         <div className="absolute top-0 left-[40%] h-full w-[20%]" style={{backgroundColor: 'rgba(234, 179, 8, 0.8)'}}></div>
         <div className="absolute top-0 left-[60%] h-full w-[40%]" style={{backgroundColor: 'rgba(239, 68, 68, 0.8)'}}></div>
        
        {/* Needle */}
        <div 
          className="absolute top-[-4px] h-8 w-1 bg-white rounded-full border-2 border-slate-900 shadow-lg transition-all duration-1000 ease-out"
          style={{ 
            left: `calc(${needlePosition}% - 2px)`,
            transitionProperty: 'left',
            }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
    </div>
  );
};