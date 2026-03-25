import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Dumbbell } from 'lucide-react';
import { exercises } from '../data/exercises';
import { STATIONS } from '../data/types';

interface ExerciseLibraryProps {
  onSelectExercise?: (exerciseId: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const ExerciseLibrary = ({ onSelectExercise, isModal, onClose }: ExerciseLibraryProps) => {
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscleGroups.some(mg => mg.toLowerCase().includes(search.toLowerCase()));
    const matchesStation = !selectedStation || ex.station === selectedStation;
    return matchesSearch && matchesStation;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={isModal ? '' : 'min-h-screen bg-dark-bg p-4 md:p-8'}>
      <div className={isModal ? '' : 'max-w-6xl mx-auto'}>
        {isModal && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Exercise Library</h2>
            <button onClick={onClose} className="p-2 hover:bg-dark-hover rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search exercises or muscle groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStation(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !selectedStation 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-dark-hover text-gray-400 hover:text-white'
              }`}
            >
              All ({exercises.length})
            </button>
            {STATIONS.map((station) => (
              <button
                key={station}
                onClick={() => setSelectedStation(station === selectedStation ? null : station)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedStation === station 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-dark-hover text-gray-400 hover:text-white'
                }`}
              >
                {station.replace('Station ', 'S')}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                variants={itemVariants}
                layout
                className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => onSelectExercise?.(exercise.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{exercise.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">{exercise.station}</p>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{exercise.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {exercise.muscleGroups.map((mg) => (
                        <span key={mg} className="px-2 py-0.5 bg-dark-hover rounded text-xs text-gray-400">
                          {mg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No exercises found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
