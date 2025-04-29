import { redirect } from "react-router"
import { getSession } from "../../lib/auth"
import { DashboardHeader } from "../../components/dashboard-header"
import { ProjectList } from "../../components/project-list"
import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router"

export default function ProjectsPage() {
  const session =  getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <DashboardHeader />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Projects</h1>
        <Link to="/projects/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <ProjectList />
    </div>
  )
}
