import { useState, useMemo } from 'react';
import { CalculateQuoteInput } from '../types';

export function useQuoteCalculator(initialRate = 0) {
  const [materialsCost, setMaterialsCost] = useState<number>(0);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(initialRate);

  const laborCost = useMemo(() => {
    return Number((estimatedHours * hourlyRate).toFixed(2));
  }, [estimatedHours, hourlyRate]);

  const suggestedPrice = useMemo(() => {
    return Number((materialsCost + laborCost).toFixed(2));
  }, [materialsCost, laborCost]);

  const setCalculation = (input: CalculateQuoteInput) => {
    setMaterialsCost(input.materialsCost);
    setEstimatedHours(input.estimatedHours);
    setHourlyRate(input.hourlyRate);
  };

  const reset = () => {
    setMaterialsCost(0);
    setEstimatedHours(0);
    setHourlyRate(initialRate);
  };

  return {
    materialsCost,
    estimatedHours,
    hourlyRate,
    laborCost,
    suggestedPrice,
    setMaterialsCost,
    setEstimatedHours,
    setHourlyRate,
    setCalculation,
    reset,
  };
}
