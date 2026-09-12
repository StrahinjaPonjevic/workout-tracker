export enum ExerciseType {
  Strength = 1,
  Cardio = 2,
  Flexibility = 3,
  Other = 4
}

export const ExerciseTypeLabels: Record<ExerciseType, string> = {
  [ExerciseType.Strength]: 'Trening snage',
  [ExerciseType.Cardio]: 'Kardio',
  [ExerciseType.Flexibility]: 'Fleksibilnost',
  [ExerciseType.Other]: 'Ostalo'
};

export const ExerciseTypeBadges: Record<ExerciseType, { bg: string; text: string; border: string }> = {
  [ExerciseType.Strength]: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20'
  },
  [ExerciseType.Cardio]: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20'
  },
  [ExerciseType.Flexibility]: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20'
  },
  [ExerciseType.Other]: {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-zinc-500/20'
  }
};

export interface Workout {
  id: string;
  exerciseType: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: number;
  fatigue: number;
  notes: string | null;
  workoutDate: string;
  createdAt: string;
}

export interface CreateWorkoutRequest {
  exerciseType: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: number;
  fatigue: number;
  notes?: string | null;
  workoutDate: string;
}

export interface UpdateWorkoutRequest {
  exerciseType: ExerciseType;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: number;
  fatigue: number;
  notes?: string | null;
  workoutDate: string;
}

export interface WeeklyStats {
  weekNumber: number;
  dateRange: string;
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  averageDifficulty: number;
  averageFatigue: number;
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalWorkouts: number;
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  averageDifficulty: number;
  averageFatigue: number;
  weeklyBreakdown: WeeklyStats[];
}
