import { softDeleteTask, updateTask } from "~/lib/tasks"
import type { Route } from "./+types/route"

export async function action({ request, params }: Route.ActionArgs) {
    const method = request.method
    const taskId = params.taskId
    const projectId = params.id

    // For DELETE requests - soft delete the task
    if (method === "DELETE") {
        await softDeleteTask(taskId)
        return { success: true, message: "Task deleted successfully" }
    }

    // For POST requests - handle status updates
    if (method === "POST") {
        const formData = await request.formData()
        const _action = formData.get("_action") as string

        // Handle task status updates from Kanban board
        if (_action === "updateTaskStatus") {
            const status = formData.get("status") as "todo" | "in-progress" | "blocked" | "done"

            if (!status) {
                return {
                    success: false,
                    message: "Status is required"
                }
            }

            try {
                await updateTask(taskId, { status })
                return {
                    success: true,
                    message: `Task status updated to ${status.replace('-', ' ')}`
                }
            } catch (error) {
                console.error("Error updating task status:", error)
                return {
                    success: false,
                    message: "Failed to update task status"
                }
            }
        }
    }

    return { success: false, message: "Invalid request method" }
}


