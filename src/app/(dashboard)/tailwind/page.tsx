"use client"

import { useState } from "react"
import { Check, Loader } from "lucide-react"

export default function ProcessTracker() {
  const [currentStep, setCurrentStep] = useState(0)

  const processes = [
    {
      id: 1,
      name: "Fetching Starred Segment",
      description: "Fetching previously cached segments from Strava and the Server",
    },
    {
      id: 2,
      name: "Fetching Segment Details",
      description: "Fetching detailed segments and updating server cache with new segments",
    },
    {
      id: 3,
      name: "Calculating Wind Data",
      description: "Calculating tailwind data for each segment",
    },
  ]

  return (
    <div className="w-full h-full flex justify-center items-center max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        {processes.map((process, index) => {
          const isComplete = currentStep > index
          const isActive = currentStep === index

          return (
            <div
              key={process.id}
              className={`p-4 border rounded-lg transition-all ${
                isComplete
                  ? "border-success bg-green-50 dark:bg-green-950/20"
                  : isActive
                  ? "border-secondary bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isComplete ? "bg-success" : isActive ? "bg-secondary" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : isActive ? (
                    <Loader className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{process.name}</h3>
                  <p className="text-sm text-muted-foreground">{process.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
