import { createTask } from "~/lib/tasks"
import type { Route } from "./+types/route"
import { redirect } from "react-router"

export async function action({ request, params }: Route.ActionArgs) {
    const method = request.method
    if (method === "POST") {
        const formData = await request.formData()
        console.log("formData", formData)
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const dueDateStr = formData.get("dueDate") as string
        const priority = formData.get("priority") as "low" | "medium" | "high"
        const status = formData.get("status") as "todo" | "in-progress" | "blocked" | "done"
        const reminder = formData.get("reminder") === "on"

        // Convert dueDate string to Date object if present
        const dueDate = dueDateStr ? new Date(dueDateStr) : undefined

        await createTask({
            title,
            description,
            dueDate,
            priority,
            status,
            reminder,
            projectId: params.id
        })
        return redirect(`/projects/${params.id}`)
    }
}


