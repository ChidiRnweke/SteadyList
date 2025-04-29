"use client"

import { Link } from "react-router"
import { useNavigate, useLocation } from "react-router"
import { LogOut, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { mockSignOut, useUser } from "../lib/auth"
import { NotificationIndicator } from "../components/notification-indicator"
import { MainNav } from "../components/main-nav"
import { MobileNav } from "../components/mobile-nav"

export function   DashboardHeader() {
    const navigate = useNavigate()
    const location = useLocation()
  const user = useUser()

  const handleSignOut = async () => {
    await mockSignOut()
    navigate("/login")
  }

  return (
    <header className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-xl font-bold text-primary hidden md:inline-block">TaskMaster</span>
        </Link>

        <div className="hidden md:flex">
          <MainNav />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationIndicator />

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="px-2 py-6">
              <MobileNav />
            </div>
          </SheetContent>
        </Sheet>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user?.image || "/placeholder.svg?height=40&width=40"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-medium">{user?.name || "User"}</DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground text-sm">
              {user?.email || "user@example.com"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
