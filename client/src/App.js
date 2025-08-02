"use client"

import { useState } from "react"
import axios from "axios"
import "./App.css"

function App() {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate message
    if (!message.trim()) {
      setStatus("Please enter a message")
      return
    }

    if (message.length > 32) {
      setStatus("Message too long (max 32 characters)")
      return
    }

    setIsLoading(true)
    setStatus("Sending...")

    try {
      const response = await axios.post("http://localhost:3001/send", {
        message: message.trim(),
      })

      setStatus(`✅ ${response.data.message}`)
      setMessage("") // Clear input after successful send
    } catch (error) {
      console.error("Error sending message:", error)
      setStatus(`❌ Error: ${error.response?.data?.error || "Failed to send message"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    if (value.length <= 32) {
      setMessage(value)
      setStatus("") // Clear status when typing
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Arduino LCD Controller</h1>
        <p>Send messages to your Arduino LCD display</p>

        <form onSubmit={handleSubmit} className="message-form">
          <div className="input-group">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder="Enter your message (max 32 chars)"
              className="message-input"
              disabled={isLoading}
              maxLength={32}
            />
            <div className="char-counter">{message.length}/32</div>
          </div>

          <button type="submit" className="send-button" disabled={isLoading || !message.trim()}>
            {isLoading ? "Sending..." : "Send to LCD"}
          </button>
        </form>

        {status && <div className={`status-message ${status.includes("❌") ? "error" : "success"}`}>{status}</div>}

        <div className="info-panel">
          <h3>Instructions:</h3>
          <ul>
            <li>Make sure your Arduino is connected to COM3</li>
            <li>Ensure the backend server is running on port 3001</li>
            <li>Messages are limited to 32 characters for LCD compatibility</li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default App
