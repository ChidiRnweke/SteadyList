"use client"

import { Link } from "react-router"
import { FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Bell } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../lib/utils"
import { Switch } from "./ui/switch"
import { useFetcher } from "react-router"
import { Form as ReactRouterForm } from "react-router"
import { useEffect } from "react"



const formSchema = z.object({
  title: z.string().min(1, "Task title is required").max(100),
  description: z.string().max(500).optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "blocked", "done"]),
  reminder: z.boolean(),
})

interface TaskFormProps {
  projectId: string
  initialStatus?: "todo" | "in-progress" | "blocked" | "done"
}

export function TaskForm({ projectId, initialStatus }: TaskFormProps) {
  const fetcher = useFetcher()
  let busy = fetcher.state !== "idle";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      priority: "medium" as "low" | "medium" | "high",
      status: initialStatus || "todo" as "todo" | "in-progress" | "blocked" | "done",
      reminder: false,
    },
  })

  useEffect(() => {
    if (initialStatus) {
      form.setValue("status", initialStatus);
    }
  }, [initialStatus, form]);

  const priorityStr = form.watch("priority");
  const statusStr = form.watch("status");
  const reminderStr = form.watch("reminder") ? "true" : "false";
  const dueDateStr = (() => {
    const d = form.watch("dueDate");
    return d ? d.toISOString() : "";
  })();


  return (
    <Card className="max-w-2xl mx-auto p-6 border-slate-200 shadow-sm">
      <FormProvider {...form}>
        <ReactRouterForm
          method="post"
          action={`/projects/${projectId}/tasks`}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
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
                    placeholder="Enter task description (optional)"
                    className="resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Provide details about what needs to be done</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When should this task be completed?</FormDescription>
                  <FormMessage />
                  <input
                    type="hidden"
                    name="dueDate"
                    value={dueDateStr}
                    readOnly
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>How important is this task?</FormDescription>
                  <FormMessage />
                  <input
                    type="hidden"
                    name="priority"
                    value={priorityStr}
                    readOnly
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo" className={initialStatus === "todo" ? "bg-secondary/10 font-medium" : ""}>
                        To Do {initialStatus === "todo" && "(Selected from board)"}
                      </SelectItem>
                      <SelectItem value="in-progress" className={initialStatus === "in-progress" ? "bg-amber-500/10 font-medium" : ""}>
                        In Progress {initialStatus === "in-progress" && "(Selected from board)"}
                      </SelectItem>
                      <SelectItem value="blocked" className={initialStatus === "blocked" ? "bg-destructive/10 font-medium" : ""}>
                        Blocked {initialStatus === "blocked" && "(Selected from board)"}
                      </SelectItem>
                      <SelectItem value="done" className={initialStatus === "done" ? "bg-green-500/10 font-medium" : ""}>
                        Done {initialStatus === "done" && "(Selected from board)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Current progress of the task</FormDescription>
                  <FormMessage />

                  <input
                    type="hidden"
                    name="status"
                    value={statusStr}
                    readOnly
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminder"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Set Reminder</FormLabel>
                  <div className="flex items-center gap-2 pt-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Bell className="h-4 w-4" />
                      Remind me about this task
                    </div>
                  </div>
                  <FormDescription>You'll receive a notification before the due date</FormDescription>
                  <FormMessage />
                  <input
                    type="hidden"
                    name="reminder"
                    value={reminderStr}
                    readOnly
                  />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              <Link to={`/projects/${projectId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={busy} className="bg-primary hover:bg-primary/90">
              {busy ? "Saving..." : initialStatus
                ? `Add to ${initialStatus === 'in-progress' ? 'In Progress' : initialStatus.charAt(0).toUpperCase() + initialStatus.slice(1)}`
                : "Create Task"}
            </Button>
          </div>
        </ReactRouterForm>
      </FormProvider>
    </Card>
  )
}
