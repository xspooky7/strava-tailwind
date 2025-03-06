import { calculateTailwind } from "@/features/tables/tailwind/server/calculate-tailwind"
import { NextRequest } from "next/server"

const API_SECRET = process.env.CLIENT_SECRET

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-secret")

    if (!apiKey || apiKey !== API_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tailwindSegments = await request.json()
    const result = await calculateTailwind(tailwindSegments)
    return Response.json(result)
  } catch (error) {
    console.error("Error processing segment data:", error)
    return Response.json({ error: "Failed to process segment data" }, { status: 500 })
  }
}
