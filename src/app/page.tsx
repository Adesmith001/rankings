
"use client";

import type * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { NomineeInputForm } from "@/components/rankings/NomineeInputForm";
import { RankingCard } from "@/components/rankings/RankingCard";
import { Scoreboard } from "@/components/rankings/Scoreboard";
import { CourseInputForm } from "@/components/rankings/CourseInputForm";
import type { Nominee, CourseRankings } from "@/types/campus-vote";
import { hasVotedCookie, setVotedCookie, getCookie as getAppCookie, setCookie as setAppCookie } from "@/lib/cookies";
import { useToast } from "@/hooks/use-toast";
import { User, Users2, GraduationCap, University } from "lucide-react";

const USER_COURSE_STORAGE_KEY = "campusVote_userCourse";
const COURSE_RANKINGS_STORAGE_KEY = "campusVote_courseRankings";
const UNIVERSITY_RANKINGS_STORAGE_KEY = "campusVote_universityRankings";

const normalizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

export default function CampusVotePage() {
  const { toast } = useToast();

  const [userCourse, setUserCourse] = useState<string | null>(null);
  const [showCourseInput, setShowCourseInput] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  const [courseRankings, setCourseRankings] = useState<CourseRankings>({});
  const [universityRankings, setUniversityRankings] = useState<Nominee[]>([]);

  const [hasVotedForCourse, setHasVotedForCourse] = useState(false);
  const [hasVotedForUniversity, setHasVotedForUniversity] = useState(false);
  
  const [isLoadingCourseVote, setIsLoadingCourseVote] = useState(false);
  const [isLoadingUniversityVote, setIsLoadingUniversityVote] = useState(false);

  // Load data from localStorage and cookies on mount
  useEffect(() => {
    const storedUserCourse = getAppCookie(USER_COURSE_STORAGE_KEY);
    if (storedUserCourse) {
      setUserCourse(storedUserCourse);
      setShowCourseInput(false);
      setHasVotedForCourse(hasVotedCookie(`course_${storedUserCourse}`));
    } else {
      setShowCourseInput(true);
    }

    try {
      const storedCourseRankings = localStorage.getItem(COURSE_RANKINGS_STORAGE_KEY);
      if (storedCourseRankings) {
        setCourseRankings(JSON.parse(storedCourseRankings));
      }
    } catch (error) {
      console.error("Failed to load course rankings from localStorage:", error);
      localStorage.removeItem(COURSE_RANKINGS_STORAGE_KEY); // Clear corrupted data
    }

    try {
      const storedUniversityRankings = localStorage.getItem(UNIVERSITY_RANKINGS_STORAGE_KEY);
      if (storedUniversityRankings) {
        setUniversityRankings(JSON.parse(storedUniversityRankings));
      }
    } catch (error) {
      console.error("Failed to load university rankings from localStorage:", error);
      localStorage.removeItem(UNIVERSITY_RANKINGS_STORAGE_KEY); // Clear corrupted data
    }
    
    setHasVotedForUniversity(hasVotedCookie("university_overall"));
  }, []);

  // Save courseRankings to localStorage
  useEffect(() => {
    if (Object.keys(courseRankings).length > 0) {
     try {
        localStorage.setItem(COURSE_RANKINGS_STORAGE_KEY, JSON.stringify(courseRankings));
      } catch (error) {
        console.error("Failed to save course rankings to localStorage:", error);
      }
    }
  }, [courseRankings]);

  // Save universityRankings to localStorage
  useEffect(() => {
    if (universityRankings.length > 0 || localStorage.getItem(UNIVERSITY_RANKINGS_STORAGE_KEY)) { // Save even if empty to clear previous data if needed
      try {
        localStorage.setItem(UNIVERSITY_RANKINGS_STORAGE_KEY, JSON.stringify(universityRankings));
      } catch (error) {
        console.error("Failed to save university rankings to localStorage:", error);
      }
    }
  }, [universityRankings]);


  const handleCourseSubmit = (courseName: string) => {
    setIsLoadingCourse(true);
    setUserCourse(courseName);
    setAppCookie(USER_COURSE_STORAGE_KEY, courseName);
    setShowCourseInput(false);
    setHasVotedForCourse(hasVotedCookie(`course_${courseName}`)); // Check if already voted for this new course
    setIsLoadingCourse(false);
    toast({
      title: "Course Saved!",
      description: `Your course is set to ${courseName}.`,
    });
  };
  
  const submitVote = useCallback(async (
    submittedName: string,
    categoryKey: string // e.g., "course_computer_science" or "university_overall"
  ): Promise<void> => {
    
    const isCourseVote = categoryKey.startsWith("course_");
    const currentCourseName = isCourseVote ? categoryKey.substring("course_".length) : null;

    if (isCourseVote) setIsLoadingCourseVote(true);
    else setIsLoadingUniversityVote(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    const normalizedSubmittedName = normalizeName(submittedName);

    if (isCourseVote && currentCourseName) {
      setCourseRankings(prevRankings => {
        const specificCourseRankings = prevRankings[currentCourseName] || [];
        const existingNomineeIndex = specificCourseRankings.findIndex(n => n.name === normalizedSubmittedName);
        let updatedSpecificCourseRankings;

        if (existingNomineeIndex > -1) {
          updatedSpecificCourseRankings = [...specificCourseRankings];
          updatedSpecificCourseRankings[existingNomineeIndex] = {
            ...updatedSpecificCourseRankings[existingNomineeIndex],
            votes: updatedSpecificCourseRankings[existingNomineeIndex].votes + 1,
          };
        } else {
          const newId = `${categoryKey}-${normalizedSubmittedName.replace(/\s+/g, '-')}-${Date.now()}`;
          updatedSpecificCourseRankings = [
            ...specificCourseRankings,
            { id: newId, name: normalizedSubmittedName, originalName: submittedName, votes: 1 }
          ];
        }
        return { ...prevRankings, [currentCourseName]: updatedSpecificCourseRankings };
      });
      setVotedCookie(categoryKey);
      setHasVotedForCourse(true);
    } else { // University vote
      setUniversityRankings(prevRankings => {
        const existingNomineeIndex = prevRankings.findIndex(n => n.name === normalizedSubmittedName);
        if (existingNomineeIndex > -1) {
          const updatedRankings = [...prevRankings];
          updatedRankings[existingNomineeIndex] = {
            ...updatedRankings[existingNomineeIndex],
            votes: updatedRankings[existingNomineeIndex].votes + 1,
          };
          return updatedRankings;
        } else {
          const newId = `${categoryKey}-${normalizedSubmittedName.replace(/\s+/g, '-')}-${Date.now()}`;
          return [...prevRankings, { id: newId, name: normalizedSubmittedName, originalName: submittedName, votes: 1 }];
        }
      });
      setVotedCookie(categoryKey);
      setHasVotedForUniversity(true);
    }

    if (isCourseVote) setIsLoadingCourseVote(false);
    else setIsLoadingUniversityVote(false);

    toast({
      title: "Vote Submitted!",
      description: `Your vote for ${submittedName} in ${isCourseVote ? currentCourseName : 'University Wide'} category has been recorded.`,
    });
  }, [toast]);


  if (showCourseInput || !userCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background text-foreground">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Welcome to Rankings!</h1>
          <p className="text-muted-foreground mt-2 text-md">First, let's get your course information.</p>
        </header>
        <CourseInputForm onSubmitCourse={handleCourseSubmit} isLoading={isLoadingCourse} />
         <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rankings. All rights reserved.</p>
           <p className="mt-2 px-4">
            **Note**: Rankings are currently stored in your browser's local storage. 
            This means vote counts are specific to this browser and not globally shared in real-time.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg-background text-foreground">
      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-primary tracking-tight">Rankings</h1>
        <p className="text-muted-foreground mt-2 text-md">
          Your course: <span className="font-semibold text-accent">{userCourse}</span>. Cast your votes!
        </p>
      </header>

      <main className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <RankingCard 
            title={`Finest Girl in ${userCourse}`}
            description={`Vote for the finest girl in your course: ${userCourse}.`}
            icon={<GraduationCap className="h-8 w-8" />}
          >
            <NomineeInputForm
              categoryKey={`course_${userCourse}`}
              categoryDisplayName={`${userCourse}`}
              onSubmitVote={submitVote}
              hasVoted={hasVotedForCourse}
              isLoading={isLoadingCourseVote}
              placeholderText="Enter nominee's name"
            />
          </RankingCard>

          <RankingCard 
            title="Finest Girl in University"
            description="Vote for the finest girl in the entire university."
            icon={<University className="h-8 w-8" />}
          >
            <NomineeInputForm
              categoryKey="university_overall"
              categoryDisplayName="University Wide"
              onSubmitVote={submitVote}
              hasVoted={hasVotedForUniversity}
              isLoading={isLoadingUniversityVote}
              placeholderText="Enter nominee's name"
            />
          </RankingCard>
        </div>

        <Scoreboard 
          userCourse={userCourse} 
          courseRankings={courseRankings} 
          universityRankings={universityRankings} 
        />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rankings. All rights reserved.</p>
        <p>Should be fun, lol.</p>
        <p className="mt-2 px-4">
          **Note**: Rankings are currently stored in your browser's local storage. 
          This means vote counts are specific to this browser and not globally shared in real-time.
        </p>
      </footer>
    </div>
  );
}
