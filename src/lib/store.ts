import { useState, useEffect } from 'react';
import { Plan } from './types';

// Custom hook to manage plans in localStorage
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('study_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse plans from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  const savePlans = (newPlans: Plan[]) => {
    setPlans(newPlans);
    localStorage.setItem('study_plans', JSON.stringify(newPlans));
  };

  const addPlan = (plan: Plan) => {
    savePlans([plan, ...plans]);
  };

  const updatePlan = (updatedPlan: Plan) => {
    savePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const deletePlan = (id: string) => {
    savePlans(plans.filter(p => p.id !== id));
  };

  return { plans, isLoaded, addPlan, updatePlan, deletePlan };
}
