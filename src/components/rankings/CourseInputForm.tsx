
"use client";

import type * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

const formSchema = z.object({
  courseName: z.string().min(3, { message: "Course name must be at least 3 characters." }).max(100, {message: "Course name must be 100 characters or less."}),
});

type CourseInputFormValues = z.infer<typeof formSchema>;

interface CourseInputFormProps {
  onSubmitCourse: (courseName: string) => void;
  isLoading: boolean;
}

export function CourseInputForm({ onSubmitCourse, isLoading }: CourseInputFormProps) {
  const form = useForm<CourseInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
    },
  });

  const handleSubmit: SubmitHandler<CourseInputFormValues> = (data) => {
    if (isLoading) return;
    onSubmitCourse(data.courseName.trim());
    form.reset();
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <BookMarked className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Enter Your Course</CardTitle>
        </div>
        <CardDescription>Please enter your course name to continue. (e.g., Computer Science)</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Mass Communication" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : "Save Course"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
