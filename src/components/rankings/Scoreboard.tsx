
"use client";

import type * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Nominee, CourseRankings } from "@/types/campus-vote";
import { Trophy, Users, Globe } from "lucide-react";

interface ScoreboardProps {
  userCourse: string | null;
  courseRankings: CourseRankings; // All course rankings
  universityRankings: Nominee[];
}

const RankedListItem: React.FC<{ nominee: Nominee; rank: number }> = ({ nominee, rank }) => (
  <TableRow>
    <TableCell className="font-medium w-12 text-center">{rank}</TableCell>
    <TableCell>{nominee.originalName}</TableCell> {/* Display original submitted name */}
    <TableCell className="text-right w-20">{nominee.votes}</TableCell>
  </TableRow>
);

export function Scoreboard({ userCourse, courseRankings, universityRankings }: ScoreboardProps) {
  
  const sortedUniversityRankings = [...universityRankings].sort((a, b) => b.votes - a.votes);
  
  const userCourseSpecificRankings = userCourse && courseRankings[userCourse]
    ? [...courseRankings[userCourse]].sort((a, b) => b.votes - a.votes)
    : [];

  const renderRankingTable = (data: Nominee[]) => {
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
            <RankedListItem key={nominee.id} nominee={nominee} rank={index + 1} />
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
        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 mb-4">
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
              {renderRankingTable(userCourseSpecificRankings)}
            </TabsContent>
          )}
          <TabsContent value="university">
            {renderRankingTable(sortedUniversityRankings)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
