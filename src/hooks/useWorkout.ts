import { useState, useCallback } from 'react';
import { Workout, Station } from '../data/types';

const STORAGE_KEY = 'crosstraining_workouts';

export const useWorkout = () => {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);

  const loadSavedWorkouts = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedWorkouts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  }, []);

  const saveWorkout = useCallback((workout: Workout) => {
    try {
      const workouts = [...savedWorkouts, { ...workout, id: Date.now().toString(), savedAt: new Date().toISOString() }];
      setSavedWorkouts(workouts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  }, [savedWorkouts]);

  const deleteWorkout = useCallback((id: string) => {
    try {
      const workouts = savedWorkouts.filter(w => w.id !== id);
      setSavedWorkouts(workouts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  }, [savedWorkouts]);

  const createNewWorkout = useCallback((stations: Station[]) => {
    const workout: Workout = {
      id: Date.now().toString(),
      name: 'New Workout',
      stations,
      createdAt: new Date().toISOString()
    };
    setCurrentWorkout(workout);
    setCurrentStationIndex(0);
    return workout;
  }, []);

  const loadWorkout = useCallback((workout: Workout) => {
    setCurrentWorkout(workout);
    setCurrentStationIndex(0);
  }, []);

  const updateWorkoutName = useCallback((name: string) => {
    if (currentWorkout) {
      setCurrentWorkout({ ...currentWorkout, name });
    }
  }, [currentWorkout]);

  const goToStation = useCallback((index: number) => {
    if (currentWorkout && index >= 0 && index < currentWorkout.stations.length) {
      setCurrentStationIndex(index);
    }
  }, [currentWorkout]);

  const nextStation = useCallback(() => {
    if (currentWorkout && currentStationIndex < currentWorkout.stations.length - 1) {
      setCurrentStationIndex(prev => prev + 1);
    }
  }, [currentWorkout, currentStationIndex]);

  const prevStation = useCallback(() => {
    if (currentStationIndex > 0) {
      setCurrentStationIndex(prev => prev - 1);
    }
  }, [currentStationIndex]);

  return {
    currentWorkout,
    savedWorkouts,
    currentStationIndex,
    loadSavedWorkouts,
    saveWorkout,
    deleteWorkout,
    createNewWorkout,
    loadWorkout,
    updateWorkoutName,
    goToStation,
    nextStation,
    prevStation,
    setCurrentStationIndex
  };
};
