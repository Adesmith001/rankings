"use client";

import type * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VoteIcon, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name must be 50 characters or less." }),
});

type NomineeInputFormValues = z.infer<typeof formSchema>;

interface NomineeInputFormProps {
  categoryKey: string; // Used for cookie and potentially unique form IDs if needed
  categoryName: string; // Displayed in UI, e.g., "MIS Girl"
  onSubmitVote: (name: string) => Promise<void>;
  hasVoted: boolean;
  isLoading: boolean;
  placeholderText?: string;
}

export function NomineeInputForm({
  categoryName,
  onSubmitVote,
  hasVoted,
  isLoading,
  placeholderText = "Enter nominee's name",
}: NomineeInputFormProps) {
  const form = useForm<NomineeInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleSubmit: SubmitHandler<NomineeInputFormValues> = async (data) => {
    if (hasVoted || isLoading) return;
    await onSubmitVote(data.name);
    form.reset(); 
  };

  if (hasVoted) {
    return (
      <Alert variant="default" className="bg-accent/50 border-accent text-accent-foreground">
        <CheckCircle2 className="h-5 w-5" />
        <AlertTitle>Vote Cast!</AlertTitle>
        <AlertDescription>
          You have already voted in the {categoryName} category. Thank you for your participation!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nominee Name for {categoryName}</FormLabel>
              <FormControl>
                <Input placeholder={placeholderText} {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </div>
          ) : (
            <>
              <VoteIcon className="mr-2 h-4 w-4" /> Vote
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
