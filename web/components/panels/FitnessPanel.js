// web/components/panels/FitnessPanel.js
import { useState, useEffect } from 'react';
import DataChart from '../ui/DataChart';
import WorkoutCard from '../ui/WorkoutCard';
import MetricInput from '../ui/MetricInput';
import StatsGrid from '../ui/StatsGrid';

export default function FitnessPanel({ supabase, dateRange }) {
  const [workouts, setWorkouts] = useState([]);
  const [vo2MaxHistory, setVo2MaxHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutStats, setWorkoutStats] = useState({
    totalDistance: 0,
    totalCalories: 0,
    totalTime: 0,
    avgHeartRate: 0
  });

  // Format dates for API calls
  const formatDateParam = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch fitness data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Format date range for API calls
        const startDateStr = formatDateParam(dateRange.startDate);
        const endDateStr = formatDateParam(dateRange.endDate);
        
        // Fetch workout stats
        const workoutsResponse = await fetch(`/api/
