"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { createTask } from "../lib/tasks"
import { Sparkles } from "lucide-react"

interface AITaskGeneratorProps {
  projectId: string
  projectName: string
}

const formSchema = z.object({
  prompt: z.string().min(10, "Please provide a more detailed description"),
  includeDueDates: z.boolean().default(true),
  includePriorities: z.boolean().default(true),
})

// Mock AI-generated tasks based on prompt
const mockGenerateTasks = (prompt: string, includeDueDates: boolean, includePriorities: boolean) => {
  // This is a mock function that simulates AI task generation
  const basePrompt = prompt.toLowerCase()

  // Generate between 3-5 tasks
  const taskCount = Math.floor(Math.random() * 3) + 3

  const tasks: any[] = []

  // Common task prefixes
  const taskPrefixes = [
    "Research",
    "Create",
    "Design",
    "Develop",
    "Implement",
    "Test",
    "Review",
    "Analyze",
    "Plan",
    "Prepare",
    "Update",
    "Optimize",
    "Document",
  ]

  // Common task subjects based on common project types
  const webDevSubjects = [
    "landing page",
    "user authentication",
    "database schema",
    "API endpoints",
    "responsive design",
    "navigation menu",
    "user dashboard",
    "payment integration",
  ]
  const marketingSubjects = [
    "social media campaign",
    "email newsletter",
    "content calendar",
    "analytics report",
    "customer survey",
    "brand guidelines",
    "promotional materials",
  ]
  const productSubjects = [
    "user stories",
    "feature specifications",
    "prototype",
    "user testing",
    "feedback collection",
    "roadmap",
    "release plan",
  ]

  // Determine which subject list to use based on the prompt
  let subjectList = webDevSubjects
  if (basePrompt.includes("market") || basePrompt.includes("campaign") || basePrompt.includes("promotion")) {
    subjectList = marketingSubjects
  } else if (basePrompt.includes("product") || basePrompt.includes("feature") || basePrompt.includes("roadmap")) {
    subjectList = productSubjects
  }

  // Generate random tasks
  for (let i = 0; i < taskCount; i++) {
    const prefix = taskPrefixes[Math.floor(Math.random() * taskPrefixes.length)]
    const subject = subjectList[Math.floor(Math.random() * subjectList.length)]

    const task: any = {
      title: `${prefix} ${subject}`,
      description: `${prefix} the ${subject} based on project requirements and best practices.`,
      status: "todo",
    }

    // Add priority if requested
    if (includePriorities) {
      const priorities = ["low", "medium", "high"]
      task["priority"] = priorities[Math.floor(Math.random() * priorities.length)]
    } else {
      task["priority"] = "medium"
    }

    // Add due date if requested
    if (includeDueDates) {
      // Generate a random due date between 1 and 14 days from now
      const daysToAdd = Math.floor(Math.random() * 14) + 1
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysToAdd)
      task["dueDate"] = dueDate
    }

    tasks.push(task)
  }

  return tasks
}

export function AITaskGenerator({ projectId, projectName }: AITaskGeneratorProps) {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [generatedTasks, setGeneratedTasks] = useState<any[]>([])
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      includeDueDates: true,
      includePriorities: true,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsGenerating(true)
    setGeneratedTasks([])
    setSelectedTasks([])

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate mock tasks
      const tasks = mockGenerateTasks(values.prompt, values.includeDueDates, values.includePriorities)

      setGeneratedTasks(tasks)
    } catch (error) {
      console.error("Failed to generate tasks:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTaskSelection = (taskIndex: number) => {
    setSelectedTasks((prev) => {
      const taskId = taskIndex.toString()
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const handleCreateTasks = async () => {
    setIsCreating(true)

    try {
      // Create selected tasks
      for (const taskId of selectedTasks) {
        const taskIndex = Number.parseInt(taskId)
        const task = generatedTasks[taskIndex]

        await createTask({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "todo",
          dueDate: task.dueDate,
          projectId: projectId,
        })
      }

      navigate(`/projects/${projectId}`)
      navigate(0)
    } catch (error) {
      console.error("Failed to create tasks:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Generate Tasks with AI</CardTitle>
          <CardDescription>Describe what you're working on, and our AI will suggest relevant tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are you working on?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I'm building a marketing website for a new product launch"
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about your project to get more relevant task suggestions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <FormField
                  control={form.control}
                  name="includeDueDates"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Include due dates</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includePriorities"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Include priorities</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isGenerating} className="bg-secondary hover:bg-secondary/90">
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tasks
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedTasks.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Generated Tasks</CardTitle>
            <CardDescription>Select the tasks you want to add to your project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedTasks.map((task, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${
                    selectedTasks.includes(index.toString()) ? "border-primary bg-primary/5" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${index}`}
                      checked={selectedTasks.includes(index.toString())}
                      onCheckedChange={() => handleTaskSelection(index)}
                    />
                    <div className="space-y-1">
                      <label htmlFor={`task-${index}`} className="font-medium cursor-pointer">
                        {task.title}
                      </label>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.priority && (
                          <div className="text-xs px-2 py-1 rounded-full bg-slate-100">
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-xs px-2 py-1 rounded-full bg-slate-100">
                            Due: {task.dueDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateTasks}
              disabled={selectedTasks.length === 0 || isCreating}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Creating Tasks...
                </>
              ) : (
                <>
                  Add {selectedTasks.length} {selectedTasks.length === 1 ? "Task" : "Tasks"} to Project
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
