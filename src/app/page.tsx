
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
import { User, Users2 } from "lucide-react";

const MIS_RANKINGS_STORAGE_KEY = "campusVote_misRankings";
const CS_RANKINGS_STORAGE_KEY = "campusVote_csRankings";

export default function CampusVotePage() {
  const { toast } = useToast();

  const [misRankings, setMisRankings] = useState<Nominee[]>([]);
  const [csRankings, setCsRankings] = useState<CSNominee[]>([]);

  const [hasVotedMis, setHasVotedMis] = useState(false);
  const [hasVotedCs, setHasVotedCs] = useState(false);
  
  const [isLoadingMis, setIsLoadingMis] = useState(false);
  const [isLoadingCs, setIsLoadingCs] = useState(false);

  const [selectedVoterDeptForCs, setSelectedVoterDeptForCs] = useState<'MIS' | 'CS' | undefined>(undefined);

  // Load data from localStorage and check voting cookies on mount
  useEffect(() => {
    // Load MIS Rankings from localStorage
    try {
      const storedMisData = localStorage.getItem(MIS_RANKINGS_STORAGE_KEY);
      if (storedMisData) {
        const parsedData = JSON.parse(storedMisData) as Nominee[];
        if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.votes === 'number')) {
          setMisRankings(parsedData);
        } else if (parsedData !== null && parsedData !== undefined) { // Handles cases where "null" or "undefined" string was stored
           console.warn("MIS rankings data in localStorage is malformed. Resetting.");
           localStorage.removeItem(MIS_RANKINGS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse MIS rankings from localStorage:", error);
    }

    // Load CS Rankings from localStorage
    try {
      const storedCsData = localStorage.getItem(CS_RANKINGS_STORAGE_KEY);
      if (storedCsData) {
        const parsedData = JSON.parse(storedCsData) as CSNominee[];
        if (Array.isArray(parsedData) && parsedData.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.votes === 'number')) {
          setCsRankings(parsedData);
        } else if (parsedData !== null && parsedData !== undefined) {
           console.warn("CS rankings data in localStorage is malformed. Resetting.");
           localStorage.removeItem(CS_RANKINGS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse CS rankings from localStorage:", error);
    }

    setHasVotedMis(hasVotedCookie("mis_girls"));
    setHasVotedCs(hasVotedCookie("cs_department_girls"));
  }, []);

  // Save MIS rankings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(MIS_RANKINGS_STORAGE_KEY, JSON.stringify(misRankings));
    } catch (error) {
      console.error("Failed to save MIS rankings to localStorage:", error);
    }
  }, [misRankings]);

  // Save CS rankings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CS_RANKINGS_STORAGE_KEY, JSON.stringify(csRankings));
    } catch (error) {
      console.error("Failed to save CS rankings to localStorage:", error);
    }
  }, [csRankings]);

  // Simulate API call and update state
  const generalSubmitVote = useCallback(async (
    categoryKey: string,
    nomineeName: string,
    currentRankings: Nominee[], // This parameter is not strictly needed if setRankings directly uses its callback form
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
    // Pass misRankings to satisfy generalSubmitVote, though it uses the callback form of setMisRankings
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
    // Pass csRankings similarly
    await generalSubmitVote("cs_department_girls", name, csRankings, setCsRankings, setHasVotedCs, setIsLoadingCs, "CS Department Girls", selectedVoterDeptForCs);
  }, [generalSubmitVote, csRankings, selectedVoterDeptForCs, toast]);


  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">CampusVote</h1>
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
              {!selectedVoterDeptForCs && !(hasVotedCs || isLoadingCs) && <p className="text-xs text-destructive mt-1">Please select an affiliation to vote.</p>}
            </div>
            <NomineeInputForm
              categoryKey="cs_department_girls"
              categoryName="CS Department Girls"
              onSubmitVote={handleVoteCs}
              hasVoted={hasVotedCs}
              isLoading={isLoadingCs}
              placeholderText="Enter CS girl's name"
              disabled={!selectedVoterDeptForCs && !hasVotedCs} // Disable form if no affiliation selected and not yet voted
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

