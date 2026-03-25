import { Exercise } from './types';

export const exercises: Exercise[] = [
  // Station 1: Upper Body Push
  { id: '1', name: 'Push-ups', station: 'Station 1: Upper Body Push', description: 'Classic push-up on floor', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { id: '2', name: 'Diamond Push-ups', station: 'Station 1: Upper Body Push', description: 'Hands close together forming diamond', muscleGroups: ['Triceps', 'Chest'] },
  { id: '3', name: 'Wide Push-ups', station: 'Station 1: Upper Body Push', description: 'Hands wider than shoulder width', muscleGroups: ['Chest', 'Shoulders'] },
  { id: '4', name: 'Dumbbell Bench Press', station: 'Station 1: Upper Body Push', description: 'Flat bench with dumbbells', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { id: '5', name: 'Incline Dumbbell Press', station: 'Station 1: Upper Body Push', description: '30-45 degree incline', muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'] },
  { id: '6', name: 'Overhead Press', station: 'Station 1: Upper Body Push', description: 'Standing barbell or dumbbells', muscleGroups: ['Shoulders', 'Triceps'] },
  { id: '7', name: 'Pike Push-ups', station: 'Station 1: Upper Body Push', description: 'Hips high, targeting shoulders', muscleGroups: ['Shoulders', 'Triceps'] },
  { id: '8', name: 'Dips', station: 'Station 1: Upper Body Push', description: 'Parallel bars or bench', muscleGroups: ['Triceps', 'Chest', 'Shoulders'] },
  { id: '9', name: 'Close Grip Bench Press', station: 'Station 1: Upper Body Push', description: 'Narrow grip on barbell', muscleGroups: ['Triceps', 'Chest'] },
  { id: '10', name: 'Decline Push-ups', station: 'Station 1: Upper Body Push', description: 'Feet elevated', muscleGroups: ['Upper Chest', 'Shoulders'] },

  // Station 2: Upper Body Pull
  { id: '11', name: 'Pull-ups', station: 'Station 2: Upper Body Pull', description: 'Bodyweight or weighted', muscleGroups: ['Lats', 'Biceps', 'Rear Delts'] },
  { id: '12', name: 'Chin-ups', station: 'Station 2: Upper Body Pull', description: 'Supinated grip', muscleGroups: ['Biceps', 'Lats'] },
  { id: '13', name: 'Lat Pulldown', station: 'Station 2: Upper Body Pull', description: 'Cable machine', muscleGroups: ['Lats', 'Biceps'] },
  { id: '14', name: 'Bent Over Row', station: 'Station 2: Upper Body Pull', description: 'Barbell or dumbbells', muscleGroups: ['Back', 'Biceps', 'Rear Delts'] },
  { id: '15', name: 'Seated Cable Row', station: 'Station 2: Upper Body Pull', description: 'Cable machine', muscleGroups: ['Mid Back', 'Biceps'] },
  { id: '16', name: 'Face Pulls', station: 'Station 2: Upper Body Pull', description: 'Cable at face height', muscleGroups: ['Rear Delts', 'Upper Back'] },
  { id: '17', name: 'Inverted Rows', station: 'Station 2: Upper Body Pull', description: 'Under bar, body straight', muscleGroups: ['Rhomboids', 'Biceps', 'Lats'] },
  { id: '18', name: 'Single Arm Row', station: 'Station 2: Upper Body Pull', description: 'One arm at a time', muscleGroups: ['Lats', 'Biceps', 'Core'] },
  { id: '19', name: 'Straight Arm Pulldown', station: 'Station 2: Upper Body Pull', description: 'Cable, arms straight', muscleGroups: ['Lats'] },
  { id: '20', name: 'Dead Hang', station: 'Station 2: Upper Body Pull', description: 'Hang from bar', muscleGroups: ['Grip', 'Lats', 'Shoulders'] },

  // Station 3: Lower Body Squat
  { id: '21', name: 'Barbell Back Squat', station: 'Station 3: Lower Body Squat', description: 'High bar or low bar', muscleGroups: ['Quads', 'Glutes', 'Core'] },
  { id: '22', name: 'Front Squat', station: 'Station 3: Lower Body Squat', description: 'Barbell in front rack', muscleGroups: ['Quads', 'Core', 'Upper Back'] },
  { id: '23', name: 'Goblet Squat', station: 'Station 3: Lower Body Squat', description: 'Dumbbell or kettlebell', muscleGroups: ['Quads', 'Glutes'] },
  { id: '24', name: 'Bulgarian Split Squat', station: 'Station 3: Lower Body Squat', description: 'Rear foot elevated', muscleGroups: ['Quads', 'Glutes', 'Core'] },
  { id: '25', name: 'Leg Press', station: 'Station 3: Lower Body Squat', description: 'Machine squat', muscleGroups: ['Quads', 'Glutes'] },
  { id: '26', name: 'Leg Extension', station: 'Station 3: Lower Body Squat', description: 'Machine isolation', muscleGroups: ['Quads'] },
  { id: '27', name: 'Hack Squat', station: 'Station 3: Lower Body Squat', description: 'Machine or barbell behind', muscleGroups: ['Quads', 'Glutes'] },
  { id: '28', name: 'Wall Sit', station: 'Station 3: Lower Body Squat', description: 'Isometric hold', muscleGroups: ['Quads', 'Glutes'] },
  { id: '29', name: 'Jump Squats', station: 'Station 3: Lower Body Squat', description: 'Explosive', muscleGroups: ['Quads', 'Glutes', 'Calves'] },
  { id: '30', name: 'Pause Squat', station: 'Station 3: Lower Body Squat', description: '2-3 second pause at bottom', muscleGroups: ['Quads', 'Glutes', 'Core'] },

  // Station 4: Lower Body Hinge
  { id: '31', name: 'Deadlift', station: 'Station 4: Lower Body Hinge', description: 'Conventional or sumo', muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'] },
  { id: '32', name: 'Romanian Deadlift', station: 'Station 4: Lower Body Hinge', description: 'Barbell or dumbbells', muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'] },
  { id: '33', name: 'Good Morning', station: 'Station 4: Lower Body Hinge', description: 'Barbell on back', muscleGroups: ['Hamstrings', 'Lower Back', 'Glutes'] },
  { id: '34', name: 'Hip Thrust', station: 'Station 4: Lower Body Hinge', description: 'Barbell or bodyweight', muscleGroups: ['Glutes', 'Hamstrings'] },
  { id: '35', name: 'Kettlebell Swing', station: 'Station 4: Lower Body Hinge', description: 'American or Russian style', muscleGroups: ['Glutes', 'Hamstrings', 'Core'] },
  { id: '36', name: 'Nordic Curl', station: 'Station 4: Lower Body Hinge', description: 'Eccentric hamstring curl', muscleGroups: ['Hamstrings'] },
  { id: '37', name: 'Single Leg RDL', station: 'Station 4: Lower Body Hinge', description: 'Dumbbell or bodyweight', muscleGroups: ['Hamstrings', 'Glutes', 'Core'] },
  { id: '38', name: 'Reverse Lunge', station: 'Station 4: Lower Body Hinge', description: 'Step backward', muscleGroups: ['Glutes', 'Hamstrings', 'Quads'] },
  { id: '39', name: 'Pull Through', station: 'Station 4: Lower Body Hinge', description: 'Cable from between legs', muscleGroups: ['Glutes', 'Hamstrings'] },
  { id: '40', name: 'Glute Bridge', station: 'Station 4: Lower Body Hinge', description: 'Lying hip extension', muscleGroups: ['Glutes', 'Hamstrings'] },

  // Station 5: Core
  { id: '41', name: 'Plank', station: 'Station 5: Core', description: 'Forearms or hands', muscleGroups: ['Abs', 'Obliques', 'Lower Back'] },
  { id: '42', name: 'Dead Bug', station: 'Station 5: Core', description: 'Lying opposite arm/leg', muscleGroups: ['Abs', 'Core Stability'] },
  { id: '43', name: 'Hanging Leg Raise', station: 'Station 5: Core', description: 'Bar or captain chair', muscleGroups: ['Lower Abs', 'Hip Flexors'] },
  { id: '44', name: 'Ab Wheel Rollout', station: 'Station 5: Core', description: 'Knees or standing', muscleGroups: ['Abs', 'Lats', 'Core'] },
  { id: '45', name: 'Pallof Press', station: 'Station 5: Core', description: 'Cable or band', muscleGroups: ['Obliques', 'Core'] },
  { id: '46', name: 'Russian Twist', station: 'Station 5: Core', description: 'Weighted or bodyweight', muscleGroups: ['Obliques', 'Abs'] },
  { id: '47', name: 'Bicycle Crunch', station: 'Station 5: Core', description: 'Elbow to opposite knee', muscleGroups: ['Obliques', 'Abs'] },
  { id: '48', name: 'Mountain Climbers', station: 'Station 5: Core', description: 'Plank position, alternating knees', muscleGroups: ['Abs', 'Hip Flexors', 'Shoulders'] },
  { id: '49', name: 'Side Plank', station: 'Station 5: Core', description: 'Left and right sides', muscleGroups: ['Obliques', 'Core'] },
  { id: '50', name: 'Hanging Knee Raise', station: 'Station 5: Core', description: 'Easier than leg raise', muscleGroups: ['Lower Abs', 'Hip Flexors'] },
  { id: '51', name: 'Toes to Bar', station: 'Station 5: Core', description: 'Advanced hanging movement', muscleGroups: ['Abs', 'Grip', 'Lats'] },
  { id: '52', name: 'V-Ups', station: 'Station 5: Core', description: 'Touch toes in air', muscleGroups: ['Abs', 'Hip Flexors'] },

  // Station 6: Cardio
  { id: '53', name: 'Burpees', station: 'Station 6: Cardio', description: 'Full body explosive', muscleGroups: ['Full Body', 'Cardio'] },
  { id: '54', name: 'Box Jumps', station: 'Station 6: Cardio', description: 'Explosive plyometric', muscleGroups: ['Legs', 'Glutes', 'Cardio'] },
  { id: '55', name: 'Jump Rope', station: 'Station 6: Cardio', description: 'Double unders or singles', muscleGroups: ['Calves', 'Shoulders', 'Cardio'] },
  { id: '56', name: 'Battle Ropes', station: 'Station 6: Cardio', description: 'Waves or slams', muscleGroups: ['Shoulders', 'Arms', 'Core', 'Cardio'] },
  { id: '57', name: 'Rowing Machine', station: 'Station 6: Cardio', description: 'Calorie focused', muscleGroups: ['Back', 'Legs', 'Cardio'] },
  { id: '58', name: 'Assault Bike', station: 'Station 6: Cardio', description: 'Air bike intervals', muscleGroups: ['Full Body', 'Cardio'] },
  { id: '59', name: 'Ski Erg', station: 'Station 6: Cardio', description: 'Upper body cardio', muscleGroups: ['Arms', 'Back', 'Core', 'Cardio'] },
  { id: '60', name: 'Thrusters', station: 'Station 6: Cardio', description: 'Front squat to press', muscleGroups: ['Legs', 'Shoulders', 'Cardio'] },
  { id: '61', name: 'Running', station: 'Station 6: Cardio', description: 'Treadmill or track', muscleGroups: ['Legs', 'Cardio'] },
  { id: '62', name: 'Kettlebell Clean & Jerk', station: 'Station 6: Cardio', description: 'Full body explosive', muscleGroups: ['Full Body', 'Cardio'] },
  { id: '63', name: 'Man Maker', station: 'Station 6: Cardio', description: 'Dumbbell burpee row press', muscleGroups: ['Full Body', 'Cardio'] },
  { id: '64', name: 'Double Unders', station: 'Station 6: Cardio', description: 'Jump rope skill', muscleGroups: ['Calves', 'Shoulders', 'Cardio'] },
  { id: '65', name: 'Box Step Overs', station: 'Station 6: Cardio', description: 'No jump, step over', muscleGroups: ['Legs', 'Glutes', 'Cardio'] },
  { id: '66', name: 'Wall Balls', station: 'Station 6: Cardio', description: 'Squat to throw', muscleGroups: ['Legs', 'Shoulders', 'Core', 'Cardio'] },
];

export const getExercisesByStation = (station: string): Exercise[] => {
  return exercises.filter(e => e.station === station);
};

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find(e => e.id === id);
};
