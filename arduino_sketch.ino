/*
  Arduino LCD Serial Communication
  
  This sketch receives messages from the serial port and displays them
  on a 16x2 I2C LCD display.
  
  Hardware Requirements:
  - Arduino Uno/Nano/Pro Mini
  - 16x2 I2C LCD Display
  - Jumper wires
  
  Wiring (I2C LCD to Arduino):
  - VCC -> 5V
  - GND -> GND
  - SDA -> A4 (Uno) / Pin 20 (Mega)
  - SCL -> A5 (Uno) / Pin 21 (Mega)
  
  Libraries needed:
  - LiquidCrystal_I2C (install via Library Manager)
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Initialize LCD with I2C address 0x27 (common address)
// If this doesn't work, try 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

String receivedMessage = "";
bool messageComplete = false;
unsigned long lastMessageTime = 0;
const unsigned long MESSAGE_TIMEOUT = 10000; // Clear screen after 10 seconds

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize LCD
  lcd.init();
  lcd.backlight();
  
  // Display startup message
  lcd.setCursor(0, 0);
  lcd.print("Arduino LCD");
  lcd.setCursor(0, 1);
  lcd.print("Ready for data!");
  
  Serial.println("Arduino LCD Controller Ready");
  Serial.println("Waiting for messages...");
  
  delay(2000);
  lcd.clear();
}

void loop() {
  // Check for incoming serial data
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == '\n') {
      messageComplete = true;
      lastMessageTime = millis();
    } else {
      receivedMessage += inChar;
    }
  }
  
  // Process complete message
  if (messageComplete) {
    displayMessage(receivedMessage);
    
    // Send confirmation back to computer
    Serial.print("Displayed: ");
    Serial.println(receivedMessage);
    
    // Reset for next message
    receivedMessage = "";
    messageComplete = false;
  }
  
  // Clear screen after timeout (optional)
  if (lastMessageTime > 0 && (millis() - lastMessageTime) > MESSAGE_TIMEOUT) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Waiting...");
    lastMessageTime = 0;
  }
}

void displayMessage(String message) {
  lcd.clear();
  
  // Trim message to fit LCD
  if (message.length() > 32) {
    message = message.substring(0, 32);
  }
  
  // Display message, wrapping to second line if needed
  if (message.length() <= 16) {
    // Short message - display on first line
    lcd.setCursor(0, 0);
    lcd.print(message);
  } else {
    // Long message - split across two lines
    String line1 = message.substring(0, 16);
    String line2 = message.substring(16);
    
    lcd.setCursor(0, 0);
    lcd.print(line1);
    lcd.setCursor(0, 1);
    lcd.print(line2);
  }
}

// Function to scan for I2C devices (useful for debugging)
void scanI2C() {
  Serial.println("Scanning I2C devices...");
  
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
    }
  }
  Serial.println("I2C scan complete");
}
