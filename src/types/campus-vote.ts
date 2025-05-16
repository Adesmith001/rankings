
export interface Nominee {
  id: string;
  name: string; // This will store the normalized name
  originalName: string; // Stores the first-ever submitted version of the name for display
  votes: number;
}

// Type for storing rankings for multiple courses
export type CourseRankings = Record<string, Nominee[]>;

// No longer need CSNominee or CombinedNominee as the structure is more generic now.
