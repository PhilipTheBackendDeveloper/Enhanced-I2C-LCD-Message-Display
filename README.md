# Arduino LCD Serial Communication App

A full-stack web application that allows you to send messages from a React frontend to an Arduino LCD display via USB serial communication.

## 🚀 Features

- **React Frontend**: Clean, responsive UI with real-time feedback
- **Node.js Backend**: Express server with serial communication
- **Arduino Integration**: I2C LCD display support
- **Real-time Communication**: Instant message delivery
- **Input Validation**: 32-character limit with live counter
- **Error Handling**: Comprehensive error messages and status updates

## 📋 Requirements

### Hardware
- Arduino Uno/Nano/Pro Mini
- 16x2 I2C LCD Display
- USB cable for Arduino connection
- Jumper wires

### Software
- Node.js (v16 or higher)
- npm or yarn
- Arduino IDE
- Chrome/Firefox/Safari browser

## 🔧 Installation

### 1. Clone and Setup Backend

\`\`\`bash
# Navigate to project directory
cd lcd-serial-app

# Install backend dependencies
npm install

# Install client dependencies
npm run install-client
\`\`\`

### 2. Configure Serial Port

Edit the \`.env\` file to match your Arduino's COM port:

\`\`\`env
COM_PORT=COM3        # Windows: COM3, COM4, etc.
BAUD_RATE=9600       # Must match Arduino sketch
PORT=3001            # Backend server port
\`\`\`

### 3. Upload Arduino Sketch

1. Open \`arduino_sketch.ino\` in Arduino IDE
2. Install required library: **LiquidCrystal_I2C**
   - Go to Tools → Manage Libraries
   - Search for "LiquidCrystal_I2C" by Frank de Brabander
   - Click Install
3. Connect your Arduino via USB
4. Select correct board and port in Arduino IDE
5. Upload the sketch

### 4. Hardware Wiring

Connect I2C LCD to Arduino:

| LCD Pin | Arduino Pin |
|---------|-------------|
| VCC     | 5V          |
| GND     | GND         |
| SDA     | A4 (Uno)    |
| SCL     | A5 (Uno)    |

## 🚀 Running the Application

### Start Backend Server
\`\`\`bash
npm start
# or for development with auto-restart:
npm run dev
\`\`\`

### Start React Frontend
\`\`\`bash
# In a new terminal window:
npm run client
\`\`\`

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔍 Finding Your COM Port

### Windows
1. Open Device Manager
2. Expand "Ports (COM & LPT)"
3. Look for "Arduino Uno" or "USB Serial Device"
4. Note the COM port number (e.g., COM3, COM4)

### macOS
\`\`\`bash
ls /dev/tty.usb*
# or
ls /dev/cu.usb*
\`\`\`

### Linux
\`\`\`bash
ls /dev/ttyUSB*
# or
ls /dev/ttyACM*
\`\`\`

## 📡 API Endpoints

### GET /
Returns API status and configuration

### GET /status
Returns serial port connection status

### POST /send
Sends message to Arduino LCD
\`\`\`json
{
  "message": "Hello World!"
}
\`\`\`

## 🛠️ Troubleshooting

### Common Issues

**"Serial port is not connected"**
- Check USB cable connection
- Verify COM port in \`.env\` file
- Ensure Arduino is not open in Arduino IDE
- Try different USB port

**LCD not displaying**
- Check I2C wiring connections
- Verify LCD I2C address (try 0x3F if 0x27 doesn't work)
- Test with I2C scanner in Arduino sketch

**Frontend can't connect to backend**
- Ensure backend server is running on port 3001
- Check for CORS issues in browser console
- Verify proxy setting in client/package.json

**Permission denied on Linux/macOS**
\`\`\`bash
sudo chmod 666 /dev/ttyUSB0
# or add user to dialout group:
sudo usermod -a -G dialout $USER
\`\`\`

### Testing Serial Communication

You can test the Arduino connection using Arduino IDE's Serial Monitor:
1. Open Serial Monitor (Tools → Serial Monitor)
2. Set baud rate to 9600
3. Type a message and press Enter
4. Message should appear on LCD

## 📁 Project Structure

\`\`\`
lcd-serial-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
├── server.js              # Express backend with serial communication
├── package.json           # Backend dependencies
├── .env                   # Environment configuration
├── arduino_sketch.ino     # Arduino code for LCD
└── README.md             # This file
\`\`\`

## 🎯 Usage Tips

- Messages are limited to 32 characters for LCD compatibility
- Long messages (>16 chars) automatically wrap to second line
- LCD clears after 10 seconds of inactivity
- Real-time character counter helps stay within limits
- Status messages provide immediate feedback

## 🔄 Development

### Adding Features
- Modify React components in \`client/src/\`
- Add API endpoints in \`server.js\`
- Extend Arduino functionality in \`arduino_sketch.ino\`

### Building for Production
\`\`\`bash
npm run build-client
\`\`\`

## 📄 License

MIT License - feel free to use this project for learning and development!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy coding! 🚀**
\`\`\`
