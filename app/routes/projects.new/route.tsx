import { ProjectForm } from "../../components/project-form"

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-primary">Create New Project</h1>
        <ProjectForm />
      </div>
    </div>
  )
}
