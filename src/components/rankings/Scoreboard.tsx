
"use client";

import type * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Nominee, CourseRankings } from "@/types/campus-vote";
import { Trophy, Users, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ScoreboardProps {
  userCourse: string | null;
  courseRankings: CourseRankings; // All course rankings { [courseName]: Nominee[] }
  universityRankings: Nominee[];
  isLoadingCourseRankings: boolean;
  isLoadingUniversityRankings: boolean;
}

const RankedListItem: React.FC<{ nominee: Nominee; rank: number }> = ({ nominee, rank }) => (
  <TableRow>
    <TableCell className="font-medium w-12 text-center">{rank}</TableCell>
    <TableCell>{nominee.originalName || nominee.name}</TableCell> {/* Display original submitted name */}
    <TableCell className="text-right w-20">{nominee.votes}</TableCell>
  </TableRow>
);

const LoadingSkeletonRows: React.FC<{rowCount?: number}> = ({rowCount = 3}) => (
  <>
    {Array.from({length: rowCount}).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell className="w-12 text-center"><Skeleton className="h-5 w-5 rounded-full mx-auto" /></TableCell>
        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
        <TableCell className="text-right w-20"><Skeleton className="h-5 w-8 ml-auto" /></TableCell>
      </TableRow>
    ))}
  </>
);


export function Scoreboard({ 
  userCourse, 
  courseRankings, 
  universityRankings,
  isLoadingCourseRankings,
  isLoadingUniversityRankings 
}: ScoreboardProps) {
  
  // University rankings are already sorted by Firestore query
  
  // Course specific rankings are already sorted by Firestore query
  const userCourseSpecificRankings = userCourse && courseRankings[userCourse]
    ? courseRankings[userCourse]
    : [];

  const renderRankingTable = (data: Nominee[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right w-20">Votes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LoadingSkeletonRows />
          </TableBody>
        </Table>
      );
    }
    if (data.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No votes yet in this category.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right w-20">Votes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((nominee, index) => (
            <RankedListItem key={nominee.id || nominee.name} nominee={nominee} rank={index + 1} />
          ))}
        </TableBody>
      </Table>
    );
  };

  const defaultTab = userCourse ? "userCourse" : "university";

  return (
    <Card className="w-full shadow-xl mt-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Live Scoreboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} key={defaultTab}>
          <TabsList className="w-full grid grid-cols-1 md:grid-cols-2 space-y-3 md:space-y-0 mb-8">
            {userCourse && (
              <TabsTrigger value="userCourse" className="flex items-center gap-2">
                <Users className="h-4 w-4" /> {userCourse}
              </TabsTrigger>
            )}
            <TabsTrigger value="university" className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> University Wide
            </TabsTrigger>
          </TabsList>
          {userCourse && (
            <TabsContent value="userCourse">
              {renderRankingTable(userCourseSpecificRankings, isLoadingCourseRankings)}
            </TabsContent>
          )}
          <TabsContent value="university">
            {renderRankingTable(universityRankings, isLoadingUniversityRankings)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

