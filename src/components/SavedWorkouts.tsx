import { useWorkout } from '../hooks/useWorkout';
import { Trash2, FolderInput } from 'lucide-react';
import { muscleGroupLabels } from '../data/exercises';

export function SavedWorkouts() {
  const { savedWorkouts, loadWorkout, deleteWorkout } = useWorkout();

  if (savedWorkouts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📁</div>
        <h2 className="text-xl font-semibold text-white mb-2">No Saved Workouts</h2>
        <p className="text-zinc-400">Create and save a workout to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Saved Workouts</h2>
      <p className="text-sm text-zinc-400">{savedWorkouts.length} workout{savedWorkouts.length !== 1 ? 's' : ''} saved</p>

      <div className="space-y-3">
        {savedWorkouts.map(workout => {
          const assignedCount = workout.stations.filter(s => s.exercise).length;
          const date = new Date(workout.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={workout.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">{workout.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {workout.rounds} rounds • {assignedCount}/6 exercises • {date}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => loadWorkout(workout)}
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    title="Load workout"
                  >
                    <FolderInput className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {workout.stations.map(station => (
                  <span
                    key={station.id}
                    className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                  >
                    {station.exercise?.name || muscleGroupLabels[station.muscleGroup]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
