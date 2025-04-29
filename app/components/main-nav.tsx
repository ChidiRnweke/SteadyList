"use client"

import { Link } from "react-router"
import { useLocation } from "react-router"
import { cn } from "../lib/utils"
import { LayoutDashboard, FolderKanban, Notebook } from "lucide-react"

export function MainNav() {
  const pathname = useLocation().pathname;

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/projects",
      label: "Projects",
      icon: FolderKanban,
      active: pathname === "/projects" || pathname.startsWith("/projects/"),
    },
    {
      href: "/notes",
      label: "Notes",
      icon: Notebook,
      active: pathname === "/notes" || pathname.startsWith("/notes/"),
    },
  ]

  return (
    <nav className="flex items-center gap-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
          )}
        >
          <route.icon className="w-4 h-4 mr-2" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
