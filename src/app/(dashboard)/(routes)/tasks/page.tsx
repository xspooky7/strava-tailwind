import { verifySession } from "@/app/lib/auth/actions"
import { cn } from "@/app/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

type Category = {
  name: string
  color: {
    border: string
    bg: string
  }
}

type Task = {
  id: string
  label: string
  check: boolean
  sprint: number
  category: string
}

type Feature = {
  name: string
  items: Task[]
}

const categories: Category[] = [
  {
    name: "UI",
    color: {
      border: "border-blue-500",
      bg: "bg-blue-500",
    },
  },
  {
    name: "Backend",
    color: {
      border: "border-green-600",
      bg: "bg-green-600",
    },
  },
  {
    name: "Bug",
    color: {
      border: "border-red-600",
      bg: "bg-red-600",
    },
  },
  {
    name: "Feature",
    color: {
      border: "border-purple-600",
      bg: "bg-purple-600",
    },
  },
]

const tasks: Feature[] = [
  {
    name: "Layout/ App-Wide",
    items: [
      { id: "bug1", check: false, label: "Mobile sidebar crashing", sprint: 2, category: "Bug" },
      { id: "bug0", check: true, label: "Table margin not fluid accross viewports", sprint: 1, category: "Bug" },
      { id: "bug2", check: false, label: "Speed up page loadtimes/ time to first info", sprint: 4, category: "Bug" },
      { id: "feat2", check: false, label: "Enable site for tour with dummy", sprint: 3, category: "Feature" },
      {
        id: "feat6",
        check: false,
        label: "Dialog to save home address of user in onboarding",
        sprint: 4,
        category: "Feature",
      },
      {
        id: "bug3",
        check: true,
        label: "Unstar on strava leads to discrepancy of information",
        sprint: 4,
        category: "Bug",
      },
      {
        id: "be3",
        check: true,
        label: "Effort details should be saved on all active koms",
        sprint: 1,
        category: "Backend",
      },
      { id: "be4", check: true, label: "Scrape Effort and Pfp Links", sprint: 1, category: "Backend" },
      { id: "ui5", check: false, label: "Rework color themes", sprint: 4, category: "UI" },
      { id: "ui6", check: false, label: "Make logo", sprint: 5, category: "UI" },
      {
        id: "ui7",
        check: false,
        label: "Rewrite Scraper with TypeScript + make it more robust",
        sprint: 5,
        category: "Backend",
      },
    ],
  },
  {
    name: "Landing Page",
    items: [
      { id: "ui1", check: false, label: "Redesign landing page", sprint: 3, category: "UI" },
      { id: "ui2", check: false, label: "Homepage cta", sprint: 3, category: "UI" },
      { id: "ui3", check: false, label: "Move login form to a seperate page", sprint: 3, category: "UI" },
    ],
  },
  {
    name: "Dashboard",
    items: [
      { id: "dash1", check: false, label: "Lay out widget structure with placeholders", sprint: 3, category: "UI" },
      { id: "dash2", check: false, label: "Total Kom development graph", sprint: 5, category: "Feature" },
      { id: "dash3", check: false, label: "Lost since last visit widget", sprint: 5, category: "Feature" },
      { id: "dash4", check: false, label: "Current weather at location widget", sprint: 5, category: "Feature" },
    ],
  },
  {
    name: "Tables",
    items: [
      { id: "bug4", check: false, label: "Fix Star/Unstar flow", sprint: 3, category: "Bug" },
      { id: "feat1", check: false, label: "Refresh on triggered revalidation", sprint: 2, category: "Backend" },
      { id: "be1", check: true, label: "Timed revalidation for Kom Tables", sprint: 1, category: "Backend" },
      { id: "ui4", check: false, label: "Cleanup Kom Tables col spacing", sprint: 3, category: "UI" },
      { id: "feat4", check: true, label: "Make Kom Table cols toggable", sprint: 2, category: "Feature" },
      { id: "feat5", check: false, label: "Save Table col States in Cookies", sprint: 2, category: "Feature" },
      {
        id: "table5",
        check: false,
        label: "Date Range Picker as filter on delta table",
        sprint: 4,
        category: "Feature",
      },
    ],
  },
  {
    name: "Tailwind",
    items: [
      {
        id: "feat3",
        check: false,
        label: "Filter tables by distance to home (slider)",
        sprint: 1,
        category: "Feature",
      },
      {
        id: "tail1",
        check: false,
        label: "Display how fresh weather data is",
        sprint: 1,
        category: "Feature",
      },
      {
        id: "tail2",
        check: false,
        label: "Better structured caching of this route",
        sprint: 2,
        category: "Backend",
      },
    ],
  },
]

const currentSprint = 1

function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-6 ml-2 mb-4">
      {categories.map((category) => (
        <div key={category.name} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${category.color.bg} mr-2`}></div>
          <span className="text-sm">{category.name}</span>
        </div>
      ))}
    </div>
  )
}

function TaskItem({ task }: { task: Task }) {
  const categoryColor = categories.find((c) => c.name === task.category)?.color || {
    border: "border-gray-400",
    bg: "bg-gray-400",
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      <Checkbox
        checked={task.check}
        className={cn(
          categoryColor.border,
          "rounded-sm",
          "data-[state=checked]:text-white",
          task.check ? `${categoryColor.bg} data-[state=checked]:${categoryColor.bg}` : ""
        )}
      />
      <span className="text-sm font-medium">{task.label}</span>
      <Badge variant="outline" className="ml-auto">
        S{task.sprint}
      </Badge>
    </div>
  )
}

export default async function TaskList() {
  const currentSprintTasks = tasks.flatMap((feature) => feature.items.filter((task) => task.sprint === currentSprint))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4"> / / TODO</h1>

      {/* Current Sprint Tasks */}
      <div className="mb-4 bg-card border-main shadow-sm rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Current Sprint (S{currentSprint})</h2>
        <div className="space-y-2">
          {currentSprintTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>

      <CategoryLegend />

      {/* All Tasks by Feature */}
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((feature) => (
          <div key={feature.name} className="bg-card shadow-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{feature.name}</h2>
              <Badge variant="outline">{feature.items.length}</Badge>
            </div>
            <div className="space-y-2">
              {feature.items.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
