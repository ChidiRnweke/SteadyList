"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import type { Project } from "../lib/types"
import { useFetcher } from "react-router"

const formSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(500).optional(),
})



interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps = {}) {
  const navigate = useNavigate()
  const fetcher = useFetcher()
  let busy = fetcher.state !== "idle";


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  })




  return (
    <Card className="max-w-2xl mx-auto p-6 border-slate-200 shadow-sm">
      <Form {...form}>
        <fetcher.Form method="post" action={'/projects'} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter project description (optional)"
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Briefly describe the purpose of this project</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="bg-primary hover:bg-primary/90">
              {busy ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </fetcher.Form>
      </Form>
    </Card>
  )
}
