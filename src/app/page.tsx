"use client";

import type * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { NomineeInputForm } from "@/components/campus-vote/NomineeInputForm";
import { RankingCard } from "@/components/campus-vote/RankingCard";
import { Scoreboard } from "@/components/campus-vote/Scoreboard";
import type { Nominee, CSNominee } from "@/types/campus-vote";
import { hasVotedCookie, setVotedCookie } from "@/lib/cookies";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, Users2, Puzzle } from "lucide-react";

// Mock data - in a real app, this would come from Firebase
const initialMisGirlsData: Nominee[] = [
  { id: "mis1", name: "Alice Wonderland", votes: 10 },
  { id: "mis2", name: "Bella Swan", votes: 8 },
];

const initialCsGirlsData: CSNominee[] = [
  { id: "cs1", name: "Carol Danvers", votes: 12 },
  { id: "cs2", name: "Diana Prince", votes: 15 },
];

export default function CampusVotePage() {
  const { toast } = useToast();

  const [misRankings, setMisRankings] = useState<Nominee[]>(initialMisGirlsData);
  const [csRankings, setCsRankings] = useState<CSNominee[]>(initialCsGirlsData);

  const [hasVotedMis, setHasVotedMis] = useState(false);
  const [hasVotedCs, setHasVotedCs] = useState(false);
  
  const [isLoadingMis, setIsLoadingMis] = useState(false);
  const [isLoadingCs, setIsLoadingCs] = useState(false);

  // For CS Department Girls card, voter selects their department affiliation
  const [selectedVoterDeptForCs, setSelectedVoterDeptForCs] = useState<'MIS' | 'CS' | undefined>(undefined);

  useEffect(() => {
    setHasVotedMis(hasVotedCookie("mis_girls"));
    setHasVotedCs(hasVotedCookie("cs_department_girls"));
  }, []);

  // Simulate API call and update state
  const generalSubmitVote = useCallback(async (
    categoryKey: string,
    nomineeName: string,
    currentRankings: Nominee[],
    setRankings: React.Dispatch<React.SetStateAction<Nominee[]>>,
    setHasVotedState: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLoadingState: React.Dispatch<React.SetStateAction<boolean>>,
    categoryDisplayName: string,
    voterAffiliation?: string
  ): Promise<void> => {
    setIsLoadingState(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    setRankings(prevRankings => {
      const existingNomineeIndex = prevRankings.findIndex(n => n.name.toLowerCase() === nomineeName.toLowerCase());
      if (existingNomineeIndex > -1) {
        const updatedRankings = [...prevRankings];
        updatedRankings[existingNomineeIndex] = {
          ...updatedRankings[existingNomineeIndex],
          votes: updatedRankings[existingNomineeIndex].votes + 1,
        };
        return updatedRankings;
      } else {
        // Add new nominee if they don't exist. Generate a simple ID.
        const newId = `${categoryKey}-${nomineeName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        return [...prevRankings, { id: newId, name: nomineeName, votes: 1 }];
      }
    });

    setVotedCookie(categoryKey);
    setHasVotedState(true);
    setIsLoadingState(false);
    toast({
      title: "Vote Submitted!",
      description: `Your vote for ${nomineeName} in ${categoryDisplayName} has been recorded. ${voterAffiliation ? `(Affiliation: ${voterAffiliation})` : ''}`,
      variant: "default",
    });
  }, [toast]);


  const handleVoteMis = useCallback(async (name: string) => {
    await generalSubmitVote("mis_girls", name, misRankings, setMisRankings, setHasVotedMis, setIsLoadingMis, "MIS Girls");
  }, [generalSubmitVote, misRankings]);

  const handleVoteCs = useCallback(async (name: string) => {
    if (!selectedVoterDeptForCs) {
      toast({
        title: "Selection Required",
        description: "Please select your department affiliation before voting for a CS Department Girl.",
        variant: "destructive",
      });
      return;
    }
    await generalSubmitVote("cs_department_girls", name, csRankings, setCsRankings, setHasVotedCs, setIsLoadingCs, "CS Department Girls", selectedVoterDeptForCs);
  }, [generalSubmitVote, csRankings, selectedVoterDeptForCs, toast]);


  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-primary tracking-tight">CampusVote</h1>
        <p className="text-muted-foreground mt-2 text-lg">Cast your vote and see who's leading the polls!</p>
      </header>

      <main className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <RankingCard 
            title="MIS Girls Ranking" 
            description="Vote for your favorite MIS girl."
            icon={<User className="h-8 w-8" />}
          >
            <NomineeInputForm
              categoryKey="mis_girls"
              categoryName="MIS Girls"
              onSubmitVote={handleVoteMis}
              hasVoted={hasVotedMis}
              isLoading={isLoadingMis}
              placeholderText="Enter MIS girl's name"
            />
          </RankingCard>

          <RankingCard 
            title="CS Department Girls Ranking" 
            description="Select your department affiliation, then vote for a CS Department girl."
            icon={<Users2 className="h-8 w-8" />}
          >
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Your Department Affiliation:</Label>
              <RadioGroup
                value={selectedVoterDeptForCs}
                onValueChange={(value: 'MIS' | 'CS') => setSelectedVoterDeptForCs(value)}
                className="flex space-x-4"
                disabled={hasVotedCs || isLoadingCs}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MIS" id="voter-dept-mis" />
                  <Label htmlFor="voter-dept-mis">MIS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CS" id="voter-dept-cs" />
                  <Label htmlFor="voter-dept-cs">CS</Label>
                </div>
              </RadioGroup>
              {!selectedVoterDeptForCs && <p className="text-xs text-destructive mt-1">Please select an affiliation.</p>}
            </div>
            <NomineeInputForm
              categoryKey="cs_department_girls"
              categoryName="CS Department Girls"
              onSubmitVote={handleVoteCs}
              hasVoted={hasVotedCs}
              isLoading={isLoadingCs}
              placeholderText="Enter CS girl's name"
            />
          </RankingCard>
        </div>

        <Scoreboard misRankings={misRankings} csRankings={csRankings} />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CampusVote. All rights reserved.</p>
        <p>Powered by Next.js & Firebase Studio</p>
      </footer>
    </div>
  );
}
