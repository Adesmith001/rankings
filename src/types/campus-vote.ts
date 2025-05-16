export interface Nominee {
  id: string;
  name: string;
  votes: number;
}

// For CS Department Girls, we might want to store which department the voter affiliated with,
// but for simplicity, we'll treat them as a single pool of nominees.
// If specific tracking of voter department for CS Girls is needed for scoreboard, this can be expanded.
// For now, CSNominee is the same as Nominee.
export interface CSNominee extends Nominee {
  // Example of potential extension:
  // misAffiliatedVotes?: number;
  // csAffiliatedVotes?: number;
}

export interface CombinedNominee extends Nominee {
  category: string;
}
