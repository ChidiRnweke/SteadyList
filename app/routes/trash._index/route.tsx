import { getDeletedProjects, restoreProject } from "../../lib/projects"
import { getDeletedTasks, restoreTask } from "../../lib/tasks"
import type { Task, Project } from "../../lib/types"

export async function loader(): Promise<{ deletedProjects: Project[], deletedTasks: (Task & { projectName: string, projectDeleted: boolean })[] }> {
    try {
        const deletedProjects = await getDeletedProjects()
        const deletedTasks = await getDeletedTasks()

        return { deletedProjects, deletedTasks }
    } catch (error) {
        console.error("Error fetching deleted items:", error)
        return { deletedProjects: [], deletedTasks: [] }
    }
}

export async function action({ request }: { request: Request }) {
    const formData = await request.formData()
    const type = formData.get("type") as string
    const id = formData.get("id") as string

    if (!type || !id) {
        return { success: false, message: "Missing required fields" }
    }

    try {
        if (type === "project") {
            const success = await restoreProject(id)
            if (success) {
                return { success: true, message: "Project restored successfully" }
            }
        } else if (type === "task") {
            const success = await restoreTask(id)
            if (success) {
                return { success: true, message: "Task restored successfully" }
            }
        }

        return { success: false, message: "Failed to restore item" }
    } catch (error) {
        console.error("Error restoring item:", error)
        return { success: false, message: "An error occurred" }
    }
} 