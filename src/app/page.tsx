
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
import { GraduationCap, University } from "lucide-react";
import { firestore } from "@/lib/firebase";
import { collection, doc, runTransaction, onSnapshot, query, orderBy } from "firebase/firestore";

const USER_COURSE_STORAGE_KEY = "campusVote_userCourse";

const normalizeName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
};

export default function CampusVotePage() {
  const { toast } = useToast();

  const [userCourse, setUserCourse] = useState<string | null>(null);
  const [showCourseInput, setShowCourseInput] = useState(true); // Show course input initially
  const [isLoadingCourseForm, setIsLoadingCourseForm] = useState(false);

  const [courseRankings, setCourseRankings] = useState<CourseRankings>({});
  const [universityRankings, setUniversityRankings] = useState<Nominee[]>([]);

  const [isLoadingCourseRankings, setIsLoadingCourseRankings] = useState(true);
  const [isLoadingUniversityRankings, setIsLoadingUniversityRankings] = useState(true);

  const [hasVotedForCourse, setHasVotedForCourse] = useState(false);
  const [hasVotedForUniversity, setHasVotedForUniversity] = useState(false);
  
  const [isLoadingCourseVote, setIsLoadingCourseVote] = useState(false);
  const [isLoadingUniversityVote, setIsLoadingUniversityVote] = useState(false);

  // Load userCourse from cookie on mount
  useEffect(() => {
    const storedUserCourse = getAppCookie(USER_COURSE_STORAGE_KEY);
    if (storedUserCourse) {
      setUserCourse(storedUserCourse);
      setShowCourseInput(false);
      setHasVotedForCourse(hasVotedCookie(`course_${normalizeName(storedUserCourse)}`));
    } else {
      setShowCourseInput(true);
    }
    setHasVotedForUniversity(hasVotedCookie("university_overall"));
  }, []);

  // Listener for University Rankings
  useEffect(() => {
    setIsLoadingUniversityRankings(true);
    const universityNomineesColRef = collection(firestore, "rankings", "university_overall", "nominees");
    const q = query(universityNomineesColRef, orderBy("votes", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rankings: Nominee[] = [];
      snapshot.forEach((doc) => {
        rankings.push({ id: doc.id, ...doc.data() } as Nominee);
      });
      setUniversityRankings(rankings);
      setIsLoadingUniversityRankings(false);
    }, (error) => {
      console.error("Error fetching university rankings:", error);
      toast({ title: "Error", description: "Could not load university rankings.", variant: "destructive" });
      setIsLoadingUniversityRankings(false);
    });

    return () => unsubscribe();
  }, [toast]);

  // Listener for Course-Specific Rankings
  useEffect(() => {
    if (!userCourse) {
      setCourseRankings(prev => ({ ...prev, [userCourse || '']: [] })); // Clear specific course if userCourse is null
      setIsLoadingCourseRankings(false);
      return;
    }

    setIsLoadingCourseRankings(true);
    const normalizedCourseName = normalizeName(userCourse);
    const courseNomineesColRef = collection(firestore, "rankings", `course_${normalizedCourseName}`, "nominees");
    const q = query(courseNomineesColRef, orderBy("votes", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rankings: Nominee[] = [];
      snapshot.forEach((doc) => {
        rankings.push({ id: doc.id, ...doc.data() } as Nominee);
      });
      setCourseRankings(prevRankings => ({
        ...prevRankings,
        [userCourse]: rankings, // Store under the original (non-normalized) userCourse for display consistency
      }));
      setIsLoadingCourseRankings(false);
    }, (error) => {
      console.error(`Error fetching rankings for course ${userCourse}:`, error);
      toast({ title: "Error", description: `Could not load rankings for ${userCourse}.`, variant: "destructive" });
      setIsLoadingCourseRankings(false);
    });
    
    return () => unsubscribe();
  }, [userCourse, toast]);


  const handleCourseSubmit = (courseName: string) => {
    setIsLoadingCourseForm(true);
    const trimmedCourseName = courseName.trim();
    setUserCourse(trimmedCourseName);
    setAppCookie(USER_COURSE_STORAGE_KEY, trimmedCourseName);
    setShowCourseInput(false);
    setHasVotedForCourse(hasVotedCookie(`course_${normalizeName(trimmedCourseName)}`));
    setIsLoadingCourseForm(false);
    toast({
      title: "Course Saved!",
      description: `Your course is set to ${trimmedCourseName}.`,
    });
  };
  
  const submitVote = useCallback(async (
    submittedName: string,
    categoryKey: string 
  ): Promise<void> => {
    const isCourseVote = categoryKey.startsWith("course_");
    const currentCourseName = isCourseVote && userCourse ? userCourse : null; // Use the state's userCourse for original casing

    if (isCourseVote) setIsLoadingCourseVote(true);
    else setIsLoadingUniversityVote(true);
    
    const normalizedSubmittedName = normalizeName(submittedName);
    if (!normalizedSubmittedName) {
        toast({ title: "Invalid Name", description: "Nominee name cannot be empty.", variant: "destructive"});
        if (isCourseVote) setIsLoadingCourseVote(false);
        else setIsLoadingUniversityVote(false);
        return;
    }

    let collectionPathSegments: string[];
    if (isCourseVote && currentCourseName) {
        collectionPathSegments = ["rankings", `course_${normalizeName(currentCourseName)}`, "nominees"];
    } else {
        collectionPathSegments = ["rankings", "university_overall", "nominees"];
    }
    
    const nomineeDocRef = doc(firestore, ...collectionPathSegments, normalizedSubmittedName);

    try {
      await runTransaction(firestore, async (transaction) => {
        const nomineeDoc = await transaction.get(nomineeDocRef);
        if (!nomineeDoc.exists()) {
          transaction.set(nomineeDocRef, { 
            name: normalizedSubmittedName, 
            originalName: submittedName, // Store the first submitted version of the name
            votes: 1 
          });
        } else {
          const currentVotes = nomineeDoc.data().votes || 0;
          // originalName remains from the first vote
          transaction.update(nomineeDocRef, { votes: currentVotes + 1 });
        }
      });

      const voteCookieKey = isCourseVote && currentCourseName ? `course_${normalizeName(currentCourseName)}` : "university_overall";
      setVotedCookie(voteCookieKey);
      if (isCourseVote) setHasVotedForCourse(true);
      else setHasVotedForUniversity(true);

      toast({
        title: "Vote Submitted!",
        description: `Your vote for ${submittedName} in ${isCourseVote && currentCourseName ? currentCourseName : 'University Wide'} category has been recorded.`,
      });

    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Vote Failed",
        description: "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (isCourseVote) setIsLoadingCourseVote(false);
      else setIsLoadingUniversityVote(false);
    }
  }, [userCourse, toast]);


  if (showCourseInput || !userCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-background text-foreground">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">Welcome to Rankings!</h1>
          <p className="text-muted-foreground mt-2 text-md">First, let's get your course information.</p>
        </header>
        <CourseInputForm onSubmitCourse={handleCourseSubmit} isLoading={isLoadingCourseForm} />
         <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Rankings. All rights reserved.</p>
           <p className="mt-2 px-4">
            Rankings are updated in real-time and shared across all users.
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
         <button 
            onClick={() => {
              setShowCourseInput(true); 
              setAppCookie(USER_COURSE_STORAGE_KEY, '', -1); // Clear course cookie
              setUserCourse(null);
            }} 
            className="mt-2 text-sm text-primary hover:underline"
          >
            Change Course
          </button>
      </header>

      <main className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <RankingCard 
            title={`Finest Girl in ${userCourse}`}
            description={`Vote for the finest girl in your course: ${userCourse}.`}
            icon={<GraduationCap className="h-8 w-8" />}
          >
            <NomineeInputForm
              categoryKey={`course_${normalizeName(userCourse)}`} // Use normalized name for cookie key
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
          courseRankings={courseRankings} // This will contain { [userCourse]: Nominee[] }
          universityRankings={universityRankings}
          isLoadingCourseRankings={isLoadingCourseRankings}
          isLoadingUniversityRankings={isLoadingUniversityRankings} 
        />
      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Rankings. All rights reserved.</p>
        <p>Should be fun, lol.</p>
        <p className="mt-2 px-4">
          Rankings are updated in real-time and shared across all users.
        </p>
      </footer>
    </div>
  );
}
