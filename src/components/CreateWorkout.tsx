import { useState } from 'react';
import { Plus, Minus, Save, RotateCcw, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useWorkout } from '../hooks/useWorkout';
import { muscleGroupLabels, muscleGroupColors, getExercisesByMuscleGroup } from '../data/exercises';
import { Station, MuscleGroup, StationExercise } from '../data/types';

export function CreateWorkout() {
  const { currentWorkout, setCurrentWorkout, saveWorkout, resetWorkout } = useWorkout();
  const [expandedStation, setExpandedStation] = useState<number | null>(null);
  const [workoutName, setWorkoutName] = useState(currentWorkout.name);
  const [showSaved, setShowSaved] = useState(false);

  const updateStation = (index: number, updates: Partial<Station>) => {
    const newStations = [...currentWorkout.stations];
    newStations[index] = { ...newStations[index], ...updates };
    setCurrentWorkout({ ...currentWorkout, stations: newStations });
  };

  const assignExercise = (stationIndex: number, exercise: StationExercise) => {
    const station = currentWorkout.stations[stationIndex];
    updateStation(stationIndex, {
      exercise: { ...exercise, muscleGroup: station.muscleGroup },
    });
    setExpandedStation(null);
  };

  const clearExercise = (stationIndex: number) => {
    updateStation(stationIndex, { exercise: undefined });
  };

  const handleSave = () => {
    setCurrentWorkout({ ...currentWorkout, name: workoutName });
    saveWorkout({ ...currentWorkout, name: workoutName });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const totalExercises = currentWorkout.stations.filter(s => s.exercise).length;

  return (
    <div className="space-y-6">
      {/* Workout Name */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Workout Name</label>
        <input
          type="text"
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="My Workout"
        />
      </div>

      {/* Workout Settings */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Rounds</label>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, rounds: Math.max(1, currentWorkout.rounds - 1) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{currentWorkout.rounds}</span>
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, rounds: Math.min(10, currentWorkout.rounds + 1) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Rest (stations)</label>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, restBetweenStations: Math.max(10, currentWorkout.restBetweenStations - 5) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-10 text-center">{currentWorkout.restBetweenStations}s</span>
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, restBetweenStations: Math.min(120, currentWorkout.restBetweenStations + 5) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Rest (rounds)</label>
            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, restBetweenRounds: Math.max(30, currentWorkout.restBetweenRounds - 15) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-bold text-white w-10 text-center">{currentWorkout.restBetweenRounds}s</span>
              <button
                onClick={() => setCurrentWorkout({ ...currentWorkout, restBetweenRounds: Math.min(180, currentWorkout.restBetweenRounds + 15) })}
                className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Workout Stations</h2>
          <span className="text-sm text-zinc-400">{totalExercises}/6 assigned</span>
        </div>

        {currentWorkout.stations.map((station, index) => (
          <div key={station.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setExpandedStation(expandedStation === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400">
                  {index + 1}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${muscleGroupColors[station.muscleGroup]}`}>
                  {muscleGroupLabels[station.muscleGroup]}
                </span>
                {station.exercise && (
                  <span className="text-sm text-zinc-300">{station.exercise.name}</span>
                )}
              </div>
              {expandedStation === index ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {expandedStation === index && (
              <div className="border-t border-zinc-800">
                {/* Exercise List */}
                <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                  {getExercisesByMuscleGroup(station.muscleGroup).map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => assignExercise(index, exercise)}
                      className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div>
                        <span className="text-sm font-medium text-white">{exercise.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {exercise.reps && (
                            <span className="text-xs text-zinc-400">{exercise.reps} reps</span>
                          )}
                          {exercise.duration && (
                            <span className="text-xs text-zinc-400">{exercise.duration}s</span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                            exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {exercise.difficulty}
                          </span>
                        </div>
                      </div>
                      {station.exercise?.id === exercise.id && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>

                {station.exercise && (
                  <button
                    onClick={() => clearExercise(index)}
                    className="w-full px-4 py-2 border-t border-zinc-800 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear exercise
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={resetWorkout}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
        >
          {showSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {showSaved ? 'Saved!' : 'Save Workout'}
        </button>
      </div>
    </div>
  );
}
