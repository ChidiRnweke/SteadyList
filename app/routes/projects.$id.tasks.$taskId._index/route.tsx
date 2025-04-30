import { softDeleteTask } from "~/lib/services/tasks"
import type { Route } from "./+types/route"

export async function action({ request, params }: Route.ActionArgs) {
    const method = request.method
    const taskId = params.taskId
    const projectId = params.id

    if (method === "DELETE") {
        await softDeleteTask(taskId)
    }
}


