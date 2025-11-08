export enum BmiCategory {
  Underweight = 'Underweight',
  Normal = 'Normal weight',
  Overweight = 'Overweight',
  Obese = 'Obesity',
}

export enum UnitSystem {
  Metric = 'metric',
  Imperial = 'imperial',
}

export interface Recommendation {
  diet: string;
  exercise: string;
}