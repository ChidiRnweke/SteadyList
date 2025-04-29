"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { getAllProjects } from "../lib/projects"
import { getTasksByProject } from "../lib/tasks"
import type { Project } from "../lib/types"
import { ArrowRight, Plus } from "lucide-react"

export function DashboardProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const allProjects = await getAllProjects()
        const activeProjects = allProjects.filter((project) => !project.deleted)

        // Get the 3 most recently updated projects
        const recentProjects = activeProjects
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3)

        // Get task counts for each project
        const projectsWithCounts = await Promise.all(
          recentProjects.map(async (project) => {
            const tasks = await getTasksByProject(project.id)
            const activeTasks = tasks.filter((task) => !task.deleted)

            return {
              ...project,
              taskCount: activeTasks.length,
              todoCount: activeTasks.filter((task) => task.status === "todo").length,
              blockedCount: activeTasks.filter((task) => task.status === "blocked").length,
            }
          }),
        )

        setProjects(projectsWithCounts)
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-primary">Recent Projects</CardTitle>
          <CardDescription>Your most recently updated projects</CardDescription>
        </div>
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="text-primary">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pb-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <Link to="/projects/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <div className="p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-primary">{project.name}</h3>
                    <div className="flex gap-2">
                      {project.todoCount > 0 && (
                        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                          {project.todoCount} to do
                        </Badge>
                      )}
                      {project.blockedCount > 0 && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                          {project.blockedCount} blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
