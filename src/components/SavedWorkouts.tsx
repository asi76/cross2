import { motion } from 'framer-motion';
import { 
  Trash2, 
  Play, 
  Clock,
  Dumbbell,
  ChevronLeft
} from 'lucide-react';
import { Workout } from '../data/types';

interface SavedWorkoutsProps {
  workouts: Workout[];
  onLoad: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export const SavedWorkouts = ({ workouts, onLoad, onDelete, onBack }: SavedWorkoutsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalExercises = (workout: Workout) => {
    return workout.stations.reduce((acc, s) => acc + s.exercises.length, 0);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-dark-hover rounded-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-white">Saved Workouts</h1>
        </div>

        {workouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-dark-card p-6 rounded-2xl inline-block mb-4">
              <Dumbbell className="w-12 h-12 text-gray-600 mx-auto" />
            </div>
            <p className="text-gray-400 mb-2">No saved workouts yet</p>
            <p className="text-gray-500 text-sm">Create a workout and save it to see it here</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {workouts.map((workout, idx) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-xl mb-2">{workout.name}</h3>
                    <div className="flex items-center gap-4 text-gray-400 text-base">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4" />
                        {getTotalExercises(workout)} exercises
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {workout.stations.length} stations
                      </span>
                      <span>{formatDate(workout.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {workout.stations.filter(s => s.exercises.length > 0).map(station => (
                        <span key={station.id} className="px-2 py-1 bg-dark-hover rounded text-sm text-gray-400">
                          {station.name.replace('Station ', '')} ({station.exercises.length})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoad(workout)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Start Workout"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this workout?')) {
                          onDelete(workout.id);
                        }
                      }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-colors"
                      title="Delete Workout"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
