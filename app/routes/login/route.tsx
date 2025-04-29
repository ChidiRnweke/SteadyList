"use client"

import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { mockSignIn } from "../../lib/auth"
import { Github, ChromeIcon as Google, ComputerIcon as Microsoft } from "lucide-react"
import { redirect } from "react-router"

export default function LoginPage() {

  const handleSignIn = async (provider: string) => {
    await mockSignIn(provider)
    redirect("/")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/5 to-secondary/5">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">T</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">TaskMaster</h1>
          <p className="text-muted-foreground">Organize your work and life, effortlessly</p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Continue with your preferred single sign-on provider
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button
              variant="outline"
              className="h-12 border-2 hover:bg-secondary/5 hover:border-secondary transition-colors"
              onClick={() => handleSignIn("google")}
            >
              <Google className="mr-2 h-5 w-5 text-secondary" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 hover:bg-secondary/5 hover:border-secondary transition-colors"
              onClick={() => handleSignIn("github")}
            >
              <Github className="mr-2 h-5 w-5 text-secondary" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="h-12 border-2 hover:bg-secondary/5 hover:border-secondary transition-colors"
              onClick={() => handleSignIn("microsoft")}
            >
              <Microsoft className="mr-2 h-5 w-5 text-secondary" />
              Continue with Microsoft
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
