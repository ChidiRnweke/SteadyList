import { Link } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  CheckSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  Trash2,
  Calendar,
  Target,
} from "lucide-react";

// Custom FolderKanban icon component
function FolderKanban(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <path d="M8 10v4" />
      <path d="M12 10v2" />
      <path d="M16 10v6" />
    </svg>
  );
}

export default function Home() {
  const features = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description:
        "Organize your work into projects with intuitive Kanban boards and task tracking.",
      href: "/projects",
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      icon: CheckSquare,
      title: "Task Management",
      description:
        "Create, assign, and track tasks with priorities, due dates, and status updates.",
      href: "/projects",
      color: "bg-green-500/10 text-green-600 border-green-200",
    },
    {
      icon: Sparkles,
      title: "AI Task Generation",
      description:
        "Let AI suggest relevant tasks based on your project description and goals.",
      href: "/projects",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description:
        "Monitor project progress with real-time metrics and completion statistics.",
      href: "/projects",
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
    },
    {
      icon: Calendar,
      title: "Due Date Management",
      description:
        "Stay on top of deadlines with due date tracking and reminder notifications.",
      href: "/projects",
      color: "bg-red-500/10 text-red-600 border-red-200",
    },
    {
      icon: Trash2,
      title: "Smart Recovery",
      description:
        "Accidentally deleted something? Restore projects and tasks from the trash.",
      href: "/trash",
      color: "bg-gray-500/10 text-gray-600 border-gray-200",
    },
  ];

  const quickActions = [
    {
      title: "Create New Project",
      description: "Start organizing your work",
      href: "/projects/new",
      icon: FolderKanban,
      primary: true,
    },
    {
      title: "View All Projects",
      description: "Browse existing projects",
      href: "/projects",
      icon: Target,
      primary: false,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight">
            SteadyList
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            A powerful project management and productivity tool designed to keep
            you organized and focused
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Button
                size="lg"
                className={
                  action.primary
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : ""
                }
                variant={action.primary ? "default" : "outline"}
              >
                <action.icon className="mr-2 h-5 w-5" />
                {action.title}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary">Core Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage projects, track tasks, and boost
            productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.href}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-slate-200 hover:border-slate-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg border ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple workflow to get you started and keep you productive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold">Create Projects</h3>
            <p className="text-muted-foreground">
              Set up projects to organize your work and define clear objectives
              for each initiative.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold">Add Tasks</h3>
            <p className="text-muted-foreground">
              Break down projects into manageable tasks with priorities, due
              dates, and detailed descriptions.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor completion rates, manage deadlines, and stay on top of
              your productivity goals.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 rounded-lg p-8">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-primary">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join others who have transformed their productivity with
            SteadyList's intuitive project management tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects/new">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <FolderKanban className="mr-2 h-5 w-5" />
                Create Your First Project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
