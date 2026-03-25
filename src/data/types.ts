export interface Exercise {
  id: string;
  name: string;
  station: string;
  description: string;
  muscleGroups: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  duration?: number;
  rest?: number;
}

export interface Station {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface Workout {
  id: string;
  name: string;
  stations: Station[];
  createdAt: string;
  savedAt?: string;
}

export const STATIONS = [
  'Station 1: Upper Body Push',
  'Station 2: Upper Body Pull',
  'Station 3: Lower Body Squat',
  'Station 4: Lower Body Hinge',
  'Station 5: Core',
  'Station 6: Cardio'
] as const;

export type StationName = typeof STATIONS[number];
