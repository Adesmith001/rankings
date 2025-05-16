"use client";

import type * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Nominee, CSNominee, CombinedNominee } from "@/types/campus-vote";
import { Trophy, Users, Layers } from "lucide-react";

interface ScoreboardProps {
  misRankings: Nominee[];
  csRankings: CSNominee[];
}

const RankedListItem: React.FC<{ nominee: Nominee | CombinedNominee; rank: number }> = ({ nominee, rank }) => (
  <TableRow>
    <TableCell className="font-medium w-12 text-center">{rank}</TableCell>
    <TableCell>{nominee.name}</TableCell>
    {'category' in nominee && <TableCell className="hidden sm:table-cell">{(nominee as CombinedNominee).category}</TableCell>}
    <TableCell className="text-right w-20">{nominee.votes}</TableCell>
  </TableRow>
);

export function Scoreboard({ misRankings, csRankings }: ScoreboardProps) {
  const sortedMisRankings = [...misRankings].sort((a, b) => b.votes - a.votes);
  const sortedCsRankings = [...csRankings].sort((a, b) => b.votes - a.votes);

  const combinedRankings: CombinedNominee[] = [
    ...misRankings.map(n => ({ ...n, category: "MIS Girls" })),
    ...csRankings.map(n => ({ ...n, category: "CS Department Girls" })),
  ].sort((a, b) => b.votes - a.votes);

  const renderRankingTable = (data: (Nominee | CombinedNominee)[], isCombined: boolean = false) => {
    if (data.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No votes yet in this category.</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Rank</TableHead>
            <TableHead>Name</TableHead>
            {isCombined && <TableHead  className="hidden sm:table-cell">Category</TableHead>}
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

  return (
    <Card className="w-full shadow-xl mt-8">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Live Scoreboard</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mis">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="mis" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> MIS Girls
            </TabsTrigger>
            <TabsTrigger value="cs" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> CS Dept. Girls
            </TabsTrigger>
            <TabsTrigger value="combined" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Combined
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mis">
            {renderRankingTable(sortedMisRankings)}
          </TabsContent>
          <TabsContent value="cs">
            {renderRankingTable(sortedCsRankings)}
          </TabsContent>
          <TabsContent value="combined">
            {renderRankingTable(combinedRankings, true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

