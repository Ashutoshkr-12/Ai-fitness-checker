import React, { useState, useMemo, useCallback } from 'react';
import { BmiCategory, UnitSystem, Recommendation } from './types';
import { getFitnessAdvice } from './services/geminiService';
import { RecommendationCard } from './components/RecommendationCard';
import { BmiGauge } from './components/BmiGauge';

const getBmiCategory = (bmi: number): BmiCategory => {
  if (bmi < 18.5) return BmiCategory.Underweight;
  if (bmi < 25) return BmiCategory.Normal;
  if (bmi < 30) return BmiCategory.Overweight;
  return BmiCategory.Obese;
};

const getCategoryColor = (category: BmiCategory | null): string => {
    if (!category) return 'text-slate-400';
    switch (category) {
        case BmiCategory.Underweight: return 'text-blue-400';
        case BmiCategory.Normal: return 'text-green-400';
        case BmiCategory.Overweight: return 'text-yellow-400';
        case BmiCategory.Obese: return 'text-red-400';
        default: return 'text-slate-400';
    }
};

const Spinner: React.FC = () => (
    <div className="flex justify-center items-center my-8">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.Metric);
  const [weight, setWeight] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  
  const [bmi, setBmi] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const bmiCategory = useMemo(() => (bmi ? getBmiCategory(bmi) : null), [bmi]);
  
  const handleCalculate = useCallback(async () => {
    setError(null);

    let weightKg: number;
    let heightM: number;

    if (unitSystem === UnitSystem.Metric) {
      const w = parseFloat(weight);
      const h = parseFloat(heightCm);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        setError('Please enter valid positive numbers for weight and height.');
        return;
      }
      weightKg = w;
      heightM = h / 100;
    } else {
      const w = parseFloat(weight);
      const hFt = parseFloat(heightFt) || 0;
      const hIn = parseFloat(heightIn) || 0;
      if (isNaN(w) || (isNaN(hFt) && isNaN(hIn)) || w <= 0 || (hFt <= 0 && hIn <= 0)) {
        setError('Please enter valid positive numbers for weight and height.');
        return;
      }
      weightKg = w * 0.453592;
      const totalInches = (hFt * 12) + hIn;
      heightM = totalInches * 0.0254;
    }

    if (heightM === 0) {
        setError('Height cannot be zero.');
        return;
    }
    
    const calculatedBmi = weightKg / (heightM * heightM);
    setBmi(calculatedBmi);
    
    const category = getBmiCategory(calculatedBmi);

    setIsLoading(true);
    setShowResults(true);
    try {
      const advice = await getFitnessAdvice(category, calculatedBmi);
      setRecommendation(advice);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [unitSystem, weight, heightCm, heightFt, heightIn]);

  const handleReset = () => {
    setShowResults(false);
    setBmi(null);
    setRecommendation(null);
    setError(null);
    setWeight('');
    setHeightCm('');
    setHeightFt('');
    setHeightIn('');
  };

  const renderForm = () => (
    <main className="bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in-up">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-700 p-1 rounded-full flex gap-1">
          <button onClick={() => setUnitSystem(UnitSystem.Metric)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${unitSystem === UnitSystem.Metric ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Metric</button>
          <button onClick={() => setUnitSystem(UnitSystem.Imperial)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${unitSystem === UnitSystem.Imperial ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Imperial</button>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {unitSystem === UnitSystem.Metric ? (
            <>
              <div>
                <label htmlFor="weight-kg" className="block text-sm font-medium text-slate-400 mb-1">Weight (kg)</label>
                <input type="number" id="weight-kg" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="e.g., 70" />
              </div>
              <div>
                <label htmlFor="height-cm" className="block text-sm font-medium text-slate-400 mb-1">Height (cm)</label>
                <input type="number" id="height-cm" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="e.g., 175" />
              </div>
            </>
        ) : (
            <>
              <div>
                <label htmlFor="weight-lbs" className="block text-sm font-medium text-slate-400 mb-1">Weight (lbs)</label>
                <input type="number" id="weight-lbs" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="e.g., 155" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="height-ft" className="block text-sm font-medium text-slate-400 mb-1">Height (ft)</label>
                  <input type="number" id="height-ft" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="e.g., 5" />
                </div>
                <div className="flex-1">
                  <label htmlFor="height-in" className="block text-sm font-medium text-slate-400 mb-1">(in)</label>
                  <input type="number" id="height-in" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="e.g., 9" />
                </div>
              </div>
            </>
        )}
      </div>

      <button onClick={handleCalculate} disabled={isLoading} className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading ? 'Analyzing...' : 'Calculate & Get Plan'}
      </button>
      
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
    </main>
  );

  const renderResults = () => (
    <div className="animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-sky-400">Your Results</h2>
      </div>

      {bmi !== null && bmiCategory !== null && (
          <div className="my-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-center md:gap-8">
                  <div className="text-center md:text-left">
                      <h3 className="text-lg text-slate-400">Your BMI is</h3>
                      <p className="text-6xl font-bold my-1 text-white">{bmi.toFixed(1)}</p>
                      <p className={`text-2xl font-semibold ${getCategoryColor(bmiCategory)}`}>{bmiCategory}</p>
                  </div>
                  <BmiGauge bmi={bmi} category={bmiCategory} />
              </div>
          </div>
      )}

      {isLoading && <Spinner />}
      {error && <p className="text-red-400 text-center my-4">{error}</p>}
      
      {recommendation && !isLoading && <RecommendationCard recommendation={recommendation} />}

      <div className="text-center mt-8">
          <button onClick={handleReset} className="bg-slate-700 text-sky-300 font-semibold py-2 px-6 rounded-lg hover:bg-slate-600 transition-colors">
              Calculate New BMI
          </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">AI Fitness Checker</h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Calculate your BMI and get personalized diet & exercise plans powered by Gemini.</p>
        </header>
        
        {showResults ? renderResults() : renderForm()}

        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Disclaimer: This tool provides AI-generated suggestions and is not a substitute for professional medical advice. Consult with a healthcare provider before starting any new diet or exercise program.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;