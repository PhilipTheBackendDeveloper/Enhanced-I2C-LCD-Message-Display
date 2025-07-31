// Enhanced Speech utilities with advanced features
export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  timestamp: Date
}

export interface TTSOptions {
  voice?: SpeechSynthesisVoice
  rate?: number
  pitch?: number
  volume?: number
}

export interface VoiceProfile {
  id: string
  name: string
  voice: string
  rate: number
  pitch: number
  volume: number
  isDefault: boolean
}

export interface SpeechHistoryItem {
  id: string
  text: string
  type: "spoken" | "transcribed" | "sent"
  timestamp: Date
  confidence?: number
  language?: string
}

export interface VoiceCommand {
  command: string
  patterns: string[]
  action: string
  description: string
}

// Supported languages for speech recognition
export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸" },
  { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽" },
  { code: "fr-FR", name: "French (France)", flag: "🇫🇷" },
  { code: "de-DE", name: "German (Germany)", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian (Italy)", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "ru-RU", name: "Russian (Russia)", flag: "🇷🇺" },
  { code: "ja-JP", name: "Japanese (Japan)", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean (South Korea)", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
]

// Voice commands configuration
export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    command: "send_message",
    patterns: ["send message", "send it", "send to arduino", "transmit"],
    action: "SEND_MESSAGE",
    description: "Send the current message to Arduino",
  },
  {
    command: "clear_text",
    patterns: ["clear text", "clear message", "delete all", "reset"],
    action: "CLEAR_TEXT",
    description: "Clear the current message",
  },
  {
    command: "read_aloud",
    patterns: ["read aloud", "speak text", "say it", "read it"],
    action: "READ_ALOUD",
    description: "Read the current message aloud",
  },
  {
    command: "stop_speaking",
    patterns: ["stop speaking", "stop reading", "silence", "quiet"],
    action: "STOP_SPEAKING",
    description: "Stop current speech synthesis",
  },
  {
    command: "start_listening",
    patterns: ["start listening", "listen", "voice input", "dictate"],
    action: "START_LISTENING",
    description: "Start speech recognition",
  },
  {
    command: "stop_listening",
    patterns: ["stop listening", "stop dictation", "end input"],
    action: "STOP_LISTENING",
    description: "Stop speech recognition",
  },
]

// Check browser support
export const isSpeechRecognitionSupported = (): boolean => {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
}

export const isSpeechSynthesisSupported = (): boolean => {
  return "speechSynthesis" in window
}

export const isOnline = (): boolean => {
  return navigator.onLine
}

// Enhanced Text-to-Speech Service
export class TextToSpeechService {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private currentProfile: VoiceProfile | null = null

  constructor() {
    if (!isSpeechSynthesisSupported()) {
      throw new Error("Speech synthesis not supported in this browser")
    }

    this.synthesis = window.speechSynthesis
    this.loadVoices()

    this.synthesis.onvoiceschanged = () => {
      this.loadVoices()
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices()
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  public getVoicesByLanguage(language: string): SpeechSynthesisVoice[] {
    return this.voices.filter((voice) => voice.lang.startsWith(language.split("-")[0]))
  }

  public setVoiceProfile(profile: VoiceProfile): void {
    this.currentProfile = profile
  }

  public getCurrentProfile(): VoiceProfile | null {
    return this.currentProfile
  }

  public speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        resolve()
        return
      }

      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Use current profile or provided options
      if (this.currentProfile) {
        const voice = this.voices.find((v) => v.name === this.currentProfile!.voice)
        utterance.voice = voice || null
        utterance.rate = this.currentProfile.rate
        utterance.pitch = this.currentProfile.pitch
        utterance.volume = this.currentProfile.volume
      } else {
        utterance.voice = options.voice || this.getDefaultVoice()
        utterance.rate = options.rate || 1
        utterance.pitch = options.pitch || 1
        utterance.volume = options.volume || 1
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

      this.synthesis.speak(utterance)
    })
  }

  public stop(): void {
    this.synthesis.cancel()
  }

  public pause(): void {
    this.synthesis.pause()
  }

  public resume(): void {
    this.synthesis.resume()
  }

  private getDefaultVoice(): SpeechSynthesisVoice | null {
    const englishVoices = this.voices.filter((voice) => voice.lang.startsWith("en"))
    return englishVoices.length > 0 ? englishVoices[0] : this.voices[0] || null
  }
}

// Enhanced Speech-to-Text Service
export class SpeechToTextService {
  private recognition: any
  private isListening = false
  private currentLanguage = "en-US"
  private onResultCallback?: (result: SpeechRecognitionResult) => void
  private onErrorCallback?: (error: string) => void
  private onStartCallback?: () => void
  private onEndCallback?: () => void
  private onCommandCallback?: (command: string) => void

  constructor() {
    if (!isSpeechRecognitionSupported()) {
      throw new Error("Speech recognition not supported in this browser")
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.setupRecognition()
  }

  private setupRecognition(): void {
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.lang = this.currentLanguage
    this.recognition.maxAlternatives = 1

    this.recognition.onstart = () => {
      this.isListening = true
      this.onStartCallback?.()
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript.trim()
      const confidence = result[0].confidence
      const isFinal = result.isFinal

      // Check for voice commands
      if (isFinal) {
        const command = this.detectVoiceCommand(transcript)
        if (command) {
          this.onCommandCallback?.(command)
          return
        }
      }

      this.onResultCallback?.({
        transcript,
        confidence,
        isFinal,
        timestamp: new Date(),
      })
    }

    this.recognition.onerror = (event: any) => {
      this.isListening = false
      this.onErrorCallback?.(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.onEndCallback?.()
    }
  }

  private detectVoiceCommand(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase()

    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        if (lowerTranscript.includes(pattern.toLowerCase())) {
          return command.action
        }
      }
    }

    return null
  }

  public setLanguage(language: string): void {
    this.currentLanguage = language
    this.recognition.lang = language
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage
  }

  public startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void,
    onStart?: () => void,
    onEnd?: () => void,
    onCommand?: (command: string) => void,
  ): void {
    if (this.isListening) {
      this.stopListening()
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError
    this.onStartCallback = onStart
    this.onEndCallback = onEnd
    this.onCommandCallback = onCommand

    try {
      this.recognition.start()
    } catch (error) {
      this.onErrorCallback?.(`Failed to start recognition: ${error}`)
    }
  }

  public stopListening(): void {
    if (this.isListening) {
      this.recognition.stop()
    }
  }

  public isCurrentlyListening(): boolean {
    return this.isListening
  }
}

// Storage utilities
export class SpeechStorageService {
  private static readonly VOICE_PROFILES_KEY = "voice_profiles"
  private static readonly SPEECH_HISTORY_KEY = "speech_history"
  private static readonly SETTINGS_KEY = "speech_settings"

  public static saveVoiceProfiles(profiles: VoiceProfile[]): void {
    try {
      localStorage.setItem(this.VOICE_PROFILES_KEY, JSON.stringify(profiles))
    } catch (error) {
      console.error("Failed to save voice profiles:", error)
    }
  }

  public static loadVoiceProfiles(): VoiceProfile[] {
    try {
      const stored = localStorage.getItem(this.VOICE_PROFILES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to load voice profiles:", error)
      return []
    }
  }

  public static saveSpeechHistory(history: SpeechHistoryItem[]): void {
    try {
      // Keep only last 100 items
      const limitedHistory = history.slice(-100)
      localStorage.setItem(this.SPEECH_HISTORY_KEY, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error("Failed to save speech history:", error)
    }
  }

  public static loadSpeechHistory(): SpeechHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.SPEECH_HISTORY_KEY)
      return stored
        ? JSON.parse(stored).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          }))
        : []
    } catch (error) {
      console.error("Failed to load speech history:", error)
      return []
    }
  }

  public static saveSettings(settings: any): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }

  public static loadSettings(): any {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("Failed to load settings:", error)
      return {}
    }
  }
}

// Utility functions
export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch (error) {
    console.error("Microphone permission denied:", error)
    return false
  }
}

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
