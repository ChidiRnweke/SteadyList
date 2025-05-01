"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, useFetcher } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "./ui/form"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Separator } from "./ui/separator"
import { RichTextEditor } from "./rich-text-editor"
import {
  FileText,
  ArrowRight,
  Settings,
  Save,
  Share,
  Folder,
  Undo,
  MoreHorizontal,
  ChevronDown,
  Share2,
  Clipboard,
  Tags,
  PanelRight
} from "lucide-react"
import type { Note, Project } from "../lib/types"
import { cn } from "../lib/utils"

const formSchema = z.object({
  title: z.string().min(1, "Title required"),
  content: z.string().default(""),
  projectId: z.string().optional(),
  shareable: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>;

interface NoteFormProps {
  note?: Note
  projects: Project[]
}

export function NoteForm({ note, projects }: NoteFormProps) {
  const fetcher = useFetcher()
  let busy = fetcher.state !== "idle";

  const navigate = useNavigate()
  const searchParams = useSearchParams()

  const defaultProjectId = searchParams[0].get("projectId") || note?.projectId || undefined
  const [editorContent, setEditorContent] = useState(note?.content || "")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [projectSelectOpen, setProjectSelectOpen] = useState(false)

  // Character count for the status bar
  const charCount = editorContent.length

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      projectId: defaultProjectId,
      shareable: note?.shareable || false,
    },
  })

  // Set content value when editor content changes
  useEffect(() => {
    form.setValue("content", editorContent || "", {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [editorContent, form])

  // Create task button handler
  const handleCreateTask = () => {
    if (form.getValues("projectId")) {
      navigate(`/projects/${form.getValues("projectId")}/tasks/new?fromNote=true`)
    } else {
      navigate(`/tasks/new?fromNote=true`)
    }
  }

  // Get the project name if assigned
  const currentProject = form.getValues("projectId")
    ? projects.find(p => p.id === form.getValues("projectId"))?.name
    : null

  return (
    <div className="h-full relative">
      <TooltipProvider>
        <Form {...form}>
          <fetcher.Form
            method="post"
            action={note ? `/notes/${note.id}` : "/notes"}
            className="h-full flex flex-col"
          >
            {/* Main Editor Area */}
            <div className="flex-1 overflow-auto flex flex-col">
              {/* Top Title Bar */}
              <div className="p-4 border-b flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex-1 mb-0">
                      <FormControl>
                        <Input
                          placeholder="Untitled Note - Click to add a title"
                          {...field}
                          className="border-0 text-xl font-medium focus-visible:ring-0 focus-visible:border-0 px-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Editor Toolbar Extension */}
              <div className="px-4 py-2 bg-muted/30 border-b flex items-center gap-3 sticky top-0 z-10">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem className="mb-0">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        onOpenChange={setProjectSelectOpen}
                        open={projectSelectOpen}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FormControl>
                              <SelectTrigger className="h-8 border-muted-foreground/20 gap-1 min-w-[140px] bg-muted/40 focus:ring-primary hover:bg-muted/60 transition-colors">
                                <Folder className={cn("h-3.5 w-3.5", field.value && field.value !== "none" ? "text-primary" : "text-muted-foreground")} />
                                <SelectValue placeholder="Select project" />
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              </SelectTrigger>
                            </FormControl>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assign to project</p>
                          </TooltipContent>
                        </Tooltip>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shareable"
                  render={({ field }) => (
                    <FormItem className="mb-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FormControl>
                            <div className="flex items-center space-x-1">
                              <Button
                                type="button"
                                variant={field.value ? "secondary" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-8 px-3 gap-1 border-muted-foreground/20 transition-colors",
                                  field.value
                                    ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                                    : "bg-muted/40 hover:bg-muted/60"
                                )}
                                onClick={() => field.onChange(!field.value)}
                              >
                                <Share2 className={cn("h-3.5 w-3.5", field.value ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-xs">{field.value ? "Shared" : "Share"}</span>
                              </Button>
                            </div>
                          </FormControl>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{field.value ? "Note is shareable" : "Make note shareable"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormItem>
                  )}
                />

                <Separator orientation="vertical" className="h-6" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 gap-1 border-muted-foreground/20 bg-muted/40"
                      onClick={() => setSettingsOpen(true)}
                    >
                      <PanelRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open note settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 gap-1 border-muted-foreground/20 bg-muted/40"
                      onClick={handleCreateTask}
                    >
                      <Clipboard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">To Task</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create task from note</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-auto">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="h-full">
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={(content) => {
                            setEditorContent(content);
                          }}
                          placeholder="Start writing..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="p-2 bg-muted/50 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {charCount} characters
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={busy}
                  className="bg-primary hover:bg-primary/90 h-8 text-xs"
                >
                  {busy ? "Saving..." : note ? "Update" : "Save"}
                  <Save className="ml-2 h-3.5 w-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Hidden inputs for form submission */}
            <input type="hidden" name="content" value={editorContent} />
            <input type="hidden" name="shareable" value={form.getValues("shareable").toString()} />

            {/* Settings Sheet/Sidebar */}
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md space-y-6">
                <SheetHeader>
                  <SheetTitle>Note Settings</SheetTitle>
                  <SheetDescription>
                    Configure your note's properties and sharing options
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                        <FormDescription>Associate this note with a project</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shareable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Shareable Note</FormLabel>
                          <FormDescription className="text-xs">
                            Make this note shareable via a link
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <SheetFooter className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleCreateTask}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Task from Note
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </fetcher.Form>
        </Form>
      </TooltipProvider>
    </div>
  )
}
