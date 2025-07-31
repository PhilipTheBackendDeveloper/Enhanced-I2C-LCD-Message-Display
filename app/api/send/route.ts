import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    // Validation
    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    if (typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Message must be a string" }, { status: 400 })
    }

    if (message.length > 32) {
      return NextResponse.json({ success: false, error: "Message too long (max 32 characters)" }, { status: 400 })
    }

    // Forward to your existing Node.js server
    const serverResponse = await fetch("http://localhost:3001/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    const data = await serverResponse.json()

    if (serverResponse.ok) {
      return NextResponse.json({
        success: true,
        message: data.message || `Message sent to LCD: "${message}"`,
      })
    } else {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to send message to Arduino" },
        { status: serverResponse.status },
      )
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
