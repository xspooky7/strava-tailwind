export async function GET() {
  const encoder = new TextEncoder()
  const customReadable = new ReadableStream({
    async start(controller) {
      try {
        // Send initial message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "started",
              step: 0,
              message: "Starting process",
            })}\n\n`
          )
        )

        // Step 1: Fetch Starred Segment
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate delay
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "processing",
              step: 1,
              message: "Fetching previously cached segments from Strava and the Server",
            })}\n\n`
          )
        )

        // Step 2: Fetch Segment Details
        await new Promise((resolve) => setTimeout(resolve, 3000)) // Simulate delay
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "processing",
              step: 2,
              message: "Fetching detailed segments and updating server cache with new segments",
            })}\n\n`
          )
        )

        // Step 3: Calculate Wind Data
        await new Promise((resolve) => setTimeout(resolve, 4000)) // Simulate delay
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "processing",
              step: 3,
              message: "Calculating tailwind data for each segment",
            })}\n\n`
          )
        )

        // Complete
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "completed",
              step: 4,
              message: "Process completed",
              results: {
                segments: 42,
                tailwindOptimized: 28,
                topSegment: "Alpe d'Huez",
              },
            })}\n\n`
          )
        )

        // Close the stream
        controller.close()
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              status: "error",
              //@ts-ignore
              message: error.message,
            })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
