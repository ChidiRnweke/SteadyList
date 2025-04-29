"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, redirect } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createNote, updateNote } from "../lib/notes"
import { getAllProjects } from "../lib/projects"
import type { Note, Project } from "../lib/types"

const formSchema = z.object({
  title: z.string().min(1, "Note title is required").max(100),
  content: z.string().min(1, "Note content is required"),
  projectId: z.string().optional(),
})

interface NoteFormProps {
  note?: Note
}

export function NoteForm({ note }: NoteFormProps) {
  const navigate = useNavigate()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const loadProjects = async () => {
      const allProjects = await getAllProjects()
      setProjects(allProjects.filter((p) => !p.deleted))
    }

    loadProjects()
  }, [])

  const defaultProjectId = searchParams[0].get("projectId") || note?.projectId || undefined

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      projectId: defaultProjectId,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      if (note) {
        await updateNote(note.id, values)
      } else {
        await createNote(values)
      }

        navigate("/notes")
        navigate(0)
    } catch (error) {
      console.error("Failed to save note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 border-slate-200 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter note title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter note content" className="resize-none min-h-[200px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Project (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Associate this note with a specific project</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? "Saving..." : note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
