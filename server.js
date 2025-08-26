const express = require("express")
const cors = require("cors")
const { SerialPort } = require("serialport")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3001
const COM_PORT = process.env.COM_PORT || "COM3"
const BAUD_RATE = Number.parseInt(process.env.BAUD_RATE) || 9600

// Middleware
app.use(cors())
app.use(express.json())

// Serial port configuration
let serialPort
let isPortOpen = false

// Initialize serial port
const initializeSerialPort = () => {
  try {
    serialPort = new SerialPort({
      path: COM_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false,
    })

    // Open the port
    serialPort.open((err) => {
      if (err) {
        console.error(`❌ Failed to open serial port ${COM_PORT}:`, err.message)
        console.log("💡 Make sure your Arduino is connected and the COM port is correct")
        isPortOpen = false
      } else {
        console.log(`✅ Serial port ${COM_PORT} opened successfully`)
        isPortOpen = true
      }
    })

    // Handle port events
    serialPort.on("error", (err) => {
      console.error("❌ Serial port error:", err.message)
      isPortOpen = false
    })

    serialPort.on("close", () => {
      console.log("📡 Serial port closed")
      isPortOpen = false
    })

    serialPort.on("data", (data) => {
      console.log("📨 Received from Arduino:", data.toString())
    })
  } catch (error) {
    console.error("❌ Error initializing serial port:", error.message)
    isPortOpen = false
  }
}

// Utility function to send message to Arduino
const sendToArduino = (message) => {
  return new Promise((resolve, reject) => {
    if (!isPortOpen) {
      reject(new Error("Serial port is not open"))
      return
    }

    // Send message with newline terminator
    serialPort.write(message + "\n", (err) => {
      if (err) {
        console.error("❌ Error writing to serial port:", err.message)
        reject(err)
      } else {
        console.log(`📤 Sent to Arduino: "${message}"`)
        resolve()
      }
    })
  })
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Arduino LCD Serial API",
    status: isPortOpen ? "Connected" : "Disconnected",
    port: COM_PORT,
    baudRate: BAUD_RATE,
  })
})

app.get("/status", (req, res) => {
  res.json({
    connected: isPortOpen,
    port: COM_PORT,
    baudRate: BAUD_RATE,
  })
})

app.post("/send", async (req, res) => {
  try {
    const { message } = req.body

    // Validation
    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    if (typeof message !== "string") {
      return res.status(400).json({ error: "Message must be a string" })
    }

    if (message.length > 32) {
      return res.status(400).json({ error: "Message too long (max 32 characters)" })
    }

    if (!isPortOpen) {
      return res.status(503).json({
        error: "Serial port is not connected. Check your Arduino connection.",
      })
    }

    // Send to Arduino
    await sendToArduino(message)

    res.json({
      success: true,
      message: `Message sent to LCD: "${message}"`,
      length: message.length,
    })
  } catch (error) {
    console.error("❌ Error in /send route:", error.message)
    res.status(500).json({
      error: "Failed to send message to Arduino",
      details: error.message,
    })
  }
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  if (serialPort && isPortOpen) {
    serialPort.close(() => {
      console.log("📡 Serial port closed")
      process.exit(0)
    })
  } else {
    process.exit(0)
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Attempting to connect to ${COM_PORT} at ${BAUD_RATE} baud`)

  // Initialize serial port after a short delay
  setTimeout(initializeSerialPort, 1000)
})
