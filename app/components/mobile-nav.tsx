"use client"

import { Link } from "react-router"
import { useLocation } from "react-router"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { LayoutDashboard, FolderKanban, Notebook } from "lucide-react"

export function MobileNav() {
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
    <div className="flex flex-col gap-2">
      {routes.map((route) => (
        <Link key={route.href} to={route.href} className="w-full">
          <Button
            variant={route.active ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              route.active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <route.icon className="w-4 h-4 mr-2" />
            {route.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}
