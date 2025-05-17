
"use client";

import type * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecks } from "lucide-react"; // Changed icon

const formSchema = z.object({
  courseName: z.string().min(1, { message: "Please select your course." }),
});

type CourseInputFormValues = z.infer<typeof formSchema>;

interface CourseInputFormProps {
  onSubmitCourse: (courseName: string) => void;
  isLoading: boolean;
  courses: string[]; // Added prop for the list of courses
}

export function CourseInputForm({ onSubmitCourse, isLoading, courses }: CourseInputFormProps) {
  const form = useForm<CourseInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
    },
  });

  const handleSubmit: SubmitHandler<CourseInputFormValues> = (data) => {
    if (isLoading) return;
    onSubmitCourse(data.courseName); // data.courseName will be the selected value
    form.reset();
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <ListChecks className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Select Your Course</CardTitle>
        </div>
        <CardDescription>Please select your course from the list below to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
