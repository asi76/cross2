import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  ChevronLeft,
  Dumbbell
} from 'lucide-react';
import { STATIONS, Station, WorkoutExercise } from '../data/types';
import { getExerciseById } from '../data/exercises';
import { ExerciseLibrary } from './ExerciseLibrary';

interface CreateWorkoutProps {
  onSave: (workout: any) => void;
  onStart: (workout: any) => void;
  onBack: () => void;
}

export const CreateWorkout = ({ onSave, onStart, onBack }: CreateWorkoutProps) => {
  const [workoutName, setWorkoutName] = useState('My Workout');
  const [stations, setStations] = useState<Station[]>(
    STATIONS.map((name, index) => ({
      id: `station-${index}`,
      name,
      exercises: []
    }))
  );
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  const addExerciseToStation = (stationIndex: number, exerciseId: string) => {
    setStations(prev => prev.map((station, idx) => {
      if (idx !== stationIndex) return station;
      
      const existing = station.exercises.find(e => e.exerciseId === exerciseId);
      if (existing) return station;
      
      return {
        ...station,
        exercises: [
          ...station.exercises,
          { exerciseId, sets: 3, reps: 10, rest: 60 }
        ]
      };
    }));
  };

  const removeExerciseFromStation = (stationIndex: number, exerciseId: string) => {
    setStations(prev => prev.map((station, idx) => {
      if (idx !== stationIndex) return station;
      return {
        ...station,
        exercises: station.exercises.filter(e => e.exerciseId !== exerciseId)
      };
    }));
  };

  const updateExercise = (stationIndex: number, exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setStations(prev => prev.map((station, idx) => {
      if (idx !== stationIndex) return station;
      return {
        ...station,
        exercises: station.exercises.map(ex => 
          ex.exerciseId === exerciseId ? { ...ex, ...updates } : ex
        )
      };
    }));
  };

  const handleSave = () => {
    const workout = {
      id: Date.now().toString(),
      name: workoutName,
      stations,
      createdAt: new Date().toISOString()
    };
    onSave(workout);
  };

  const handleStart = () => {
    const workout = {
      id: Date.now().toString(),
      name: workoutName,
      stations,
      createdAt: new Date().toISOString()
    };
    onStart(workout);
  };

  const currentStation = stations[selectedStationIndex];
  const totalExercises = stations.reduce((acc, s) => acc + s.exercises.length, 0);

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-dark-hover rounded-lg text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white text-center font-medium focus:outline-none focus:border-blue-500"
            placeholder="Workout Name"
          />
          <div className="w-10" />
        </div>

        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stations.map((station, idx) => (
              <button
                key={station.id}
                onClick={() => setSelectedStationIndex(idx)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStationIndex === idx
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-card border border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                {station.name.replace('Station ', 'S')}
                {station.exercises.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {station.exercises.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={selectedStationIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{currentStation.name}</h2>
            <button
              onClick={() => setShowExerciseLibrary(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          {currentStation.exercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No exercises added yet</p>
              <p className="text-sm">Click "Add Exercise" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentStation.exercises.map((ex) => {
                const exercise = getExerciseById(ex.exerciseId);
                if (!exercise) return null;
                return (
                  <motion.div
                    key={ex.exerciseId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-hover border border-dark-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{exercise.name}</h3>
                        <p className="text-gray-500 text-sm">{exercise.description}</p>
                      </div>
                      <button
                        onClick={() => removeExerciseFromStation(selectedStationIndex, ex.exerciseId)}
                        className="p-1.5 hover:bg-red-500/20 text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-gray-500 text-xs">Sets</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(selectedStationIndex, ex.exerciseId, { sets: parseInt(e.target.value) || 1 })}
                          className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs">Reps</label>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExercise(selectedStationIndex, ex.exerciseId, { reps: parseInt(e.target.value) || 1 })}
                          className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs">Rest (sec)</label>
                        <input
                          type="number"
                          value={ex.rest}
                          onChange={(e) => updateExercise(selectedStationIndex, ex.exerciseId, { rest: parseInt(e.target.value) || 0 })}
                          className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-white"
                          min="0"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={totalExercises === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-hover border border-dark-border text-white rounded-lg font-medium hover:bg-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Save Workout
          </button>
          <button
            onClick={handleStart}
            disabled={totalExercises === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            Start Workout
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          {totalExercises} exercises across {stations.filter(s => s.exercises.length > 0).length} stations
        </p>
      </div>

      {showExerciseLibrary && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
          <div className="max-w-6xl mx-auto my-4">
            <ExerciseLibrary
              isModal
              onSelectExercise={(id) => {
                addExerciseToStation(selectedStationIndex, id);
                setShowExerciseLibrary(false);
              }}
              onClose={() => setShowExerciseLibrary(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
