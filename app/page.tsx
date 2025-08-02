// "use client"

// import type React from "react"

// import { useState, useEffect, useRef, useCallback } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Separator } from "@/components/ui/separator"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Slider } from "@/components/ui/slider"
// import { Switch } from "@/components/ui/switch"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Mic,
//   MicOff,
//   Volume2,
//   VolumeX,
//   Send,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
//   Monitor,
//   Waves,
//   Settings,
//   History,
//   User,
//   Wifi,
//   WifiOff,
//   Save,
//   Trash2,
//   Play,
//   RotateCcw,
//   Command,
//   MessageSquare,
//   Clock,
//   Star,
//   StarOff,
// } from "lucide-react"

// import {
//   TextToSpeechService,
//   SpeechToTextService,
//   SpeechStorageService,
//   isSpeechRecognitionSupported,
//   isSpeechSynthesisSupported,
//   requestMicrophonePermission,
//   isOnline,
//   generateId,
//   SUPPORTED_LANGUAGES,
//   VOICE_COMMANDS,
//   type SpeechRecognitionResult,
//   type VoiceProfile,
//   type SpeechHistoryItem,
// } from "@/lib/speechUtils"

// interface ApiResponse {
//   success: boolean
//   message: string
//   error?: string
// }

// export default function ArduinoLCDController() {
//   // Core state
//   const [message, setMessage] = useState("")
//   const [transcribedText, setTranscribedText] = useState("")
//   const [interimTranscript, setInterimTranscript] = useState("")
//   const [isListening, setIsListening] = useState(false)
//   const [isSpeaking, setIsSpeaking] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [status, setStatus] = useState<string>("")
//   const [error, setError] = useState<string>("")

//   // Advanced features state
//   const [currentLanguage, setCurrentLanguage] = useState("en-US")
//   const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])
//   const [currentProfile, setCurrentProfile] = useState<VoiceProfile | null>(null)
//   const [speechHistory, setSpeechHistory] = useState<SpeechHistoryItem[]>([])
//   const [isOnlineMode, setIsOnlineMode] = useState(true)
//   const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
//   const [autoSpeakTranscribed, setAutoSpeakTranscribed] = useState(true)

//   // Permission and support state
//   const [micPermission, setMicPermission] = useState<boolean | null>(null)
//   const [speechSupport, setSpeechSupport] = useState({
//     recognition: false,
//     synthesis: false,
//   })

//   // Dialog states
//   const [showVoiceProfileDialog, setShowVoiceProfileDialog] = useState(false)
//   const [showHistoryDialog, setShowHistoryDialog] = useState(false)
//   const [showSettingsDialog, setShowSettingsDialog] = useState(false)

//   // Voice profile creation state
//   const [newProfileName, setNewProfileName] = useState("")
//   const [newProfileVoice, setNewProfileVoice] = useState("")
//   const [newProfileRate, setNewProfileRate] = useState([1])
//   const [newProfilePitch, setNewProfilePitch] = useState([1])
//   const [newProfileVolume, setNewProfileVolume] = useState([0.8])

//   // Services
//   const ttsServiceRef = useRef<TextToSpeechService | null>(null)
//   const sttServiceRef = useRef<SpeechToTextService | null>(null)

//   // Initialize services and load data
//   useEffect(() => {
//     const initializeServices = async () => {
//       const recognitionSupported = isSpeechRecognitionSupported()
//       const synthesisSupported = isSpeechSynthesisSupported()
//       const online = isOnline()

//       setSpeechSupport({
//         recognition: recognitionSupported,
//         synthesis: synthesisSupported,
//       })
//       setIsOnlineMode(online)

//       try {
//         if (synthesisSupported) {
//           ttsServiceRef.current = new TextToSpeechService()
//         }

//         if (recognitionSupported) {
//           sttServiceRef.current = new SpeechToTextService()
//           const hasPermission = await requestMicrophonePermission()
//           setMicPermission(hasPermission)
//         }

//         // Load saved data
//         const savedProfiles = SpeechStorageService.loadVoiceProfiles()
//         const savedHistory = SpeechStorageService.loadSpeechHistory()
//         const savedSettings = SpeechStorageService.loadSettings()

//         setVoiceProfiles(savedProfiles)
//         setSpeechHistory(savedHistory)

//         // Apply saved settings
//         if (savedSettings.language) {
//           setCurrentLanguage(savedSettings.language)
//           sttServiceRef.current?.setLanguage(savedSettings.language)
//         }
//         if (savedSettings.voiceCommandsEnabled !== undefined) {
//           setVoiceCommandsEnabled(savedSettings.voiceCommandsEnabled)
//         }
//         if (savedSettings.autoSpeakTranscribed !== undefined) {
//           setAutoSpeakTranscribed(savedSettings.autoSpeakTranscribed)
//         }

//         // Set default profile
//         const defaultProfile = savedProfiles.find((p) => p.isDefault)
//         if (defaultProfile && ttsServiceRef.current) {
//           setCurrentProfile(defaultProfile)
//           ttsServiceRef.current.setVoiceProfile(defaultProfile)
//         }
//       } catch (error) {
//         console.error("Error initializing services:", error)
//         setError("Failed to initialize speech services")
//       }
//     }

//     initializeServices()

//     // Online/offline detection
//     const handleOnline = () => setIsOnlineMode(true)
//     const handleOffline = () => setIsOnlineMode(false)

//     window.addEventListener("online", handleOnline)
//     window.addEventListener("offline", handleOffline)

//     return () => {
//       ttsServiceRef.current?.stop()
//       sttServiceRef.current?.stopListening()
//       window.removeEventListener("online", handleOnline)
//       window.removeEventListener("offline", handleOffline)
//     }
//   }, [])

//   // Save settings when they change
//   useEffect(() => {
//     const settings = {
//       language: currentLanguage,
//       voiceCommandsEnabled,
//       autoSpeakTranscribed,
//     }
//     SpeechStorageService.saveSettings(settings)
//   }, [currentLanguage, voiceCommandsEnabled, autoSpeakTranscribed])

//   // Save data when it changes
//   useEffect(() => {
//     SpeechStorageService.saveVoiceProfiles(voiceProfiles)
//   }, [voiceProfiles])

//   useEffect(() => {
//     SpeechStorageService.saveSpeechHistory(speechHistory)
//   }, [speechHistory])

//   // Add to speech history
//   const addToHistory = useCallback(
//     (text: string, type: SpeechHistoryItem["type"], confidence?: number) => {
//       const historyItem: SpeechHistoryItem = {
//         id: generateId(),
//         text,
//         type,
//         timestamp: new Date(),
//         confidence,
//         language: currentLanguage,
//       }
//       setSpeechHistory((prev) => [...prev, historyItem])
//     },
//     [currentLanguage],
//   )

//   // Handle voice commands
//   const handleVoiceCommand = useCallback(
//     (command: string) => {
//       if (!voiceCommandsEnabled) return

//       switch (command) {
//         case "SEND_MESSAGE":
//           if (message.trim()) {
//             handleSubmit(new Event("submit") as any)
//           }
//           break
//         case "CLEAR_TEXT":
//           setMessage("")
//           setTranscribedText("")
//           setInterimTranscript("")
//           addToHistory("Text cleared", "spoken")
//           break
//         case "READ_ALOUD":
//           if (message.trim()) {
//             speakText(message)
//           }
//           break
//         case "STOP_SPEAKING":
//           stopSpeaking()
//           break
//         case "START_LISTENING":
//           startListening()
//           break
//         case "STOP_LISTENING":
//           stopListening()
//           break
//       }
//     },
//     [message, voiceCommandsEnabled],
//   )

//   // Speech recognition
//   const startListening = async () => {
//     if (!sttServiceRef.current || !micPermission) {
//       if (!micPermission) {
//         const hasPermission = await requestMicrophonePermission()
//         setMicPermission(hasPermission)
//         if (!hasPermission) {
//           setError("Microphone permission is required for speech recognition")
//           return
//         }
//       } else {
//         setError("Speech recognition service not available")
//         return
//       }
//     }

//     if (!isOnlineMode && !speechSupport.recognition) {
//       setError("Speech recognition requires an internet connection")
//       return
//     }

//     setError("")
//     setTranscribedText("")
//     setInterimTranscript("")

//     sttServiceRef.current.startListening(
//       (result: SpeechRecognitionResult) => {
//         if (result.isFinal) {
//           setTranscribedText(result.transcript)
//           setInterimTranscript("")
//           setMessage(result.transcript)
//           addToHistory(result.transcript, "transcribed", result.confidence)

//           if (autoSpeakTranscribed) {
//             speakText(result.transcript)
//           }
//         } else {
//           setInterimTranscript(result.transcript)
//         }
//       },
//       (error: string) => {
//         setError(`Speech recognition error: ${error}`)
//         setIsListening(false)
//       },
//       () => {
//         setIsListening(true)
//         setStatus("Listening... Speak now!")
//       },
//       () => {
//         setIsListening(false)
//         setStatus("")
//       },
//       handleVoiceCommand,
//     )
//   }

//   const stopListening = () => {
//     sttServiceRef.current?.stopListening()
//     setIsListening(false)
//     setInterimTranscript("")
//   }

//   // Text-to-speech
//   const speakText = async (text: string) => {
//     if (!ttsServiceRef.current || !text.trim()) {
//       if (!text.trim()) {
//         setError("No text to speak")
//       } else {
//         setError("Text-to-speech service not available")
//       }
//       return
//     }

//     try {
//       setIsSpeaking(true)
//       setError("")
//       setStatus("Speaking...")

//       await ttsServiceRef.current.speak(text)
//       addToHistory(text, "spoken")
//       setStatus("Speech completed")
//     } catch (error) {
//       setError(`Speech synthesis error: ${error}`)
//     } finally {
//       setIsSpeaking(false)
//     }
//   }

//   const stopSpeaking = () => {
//     ttsServiceRef.current?.stop()
//     setIsSpeaking(false)
//     setStatus("")
//   }

//   // Form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     const textToSend = message.trim()
//     if (!textToSend) {
//       setError("Please enter a message or use speech recognition")
//       return
//     }

//     if (textToSend.length > 32) {
//       setError("Message too long (max 32 characters)")
//       return
//     }

//     setIsSubmitting(true)
//     setError("")
//     setStatus("Sending to Arduino...")

//     try {
//       const response = await fetch("/api/send", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ message: textToSend }),
//       })

//       const data: ApiResponse = await response.json()

//       if (data.success) {
//         setStatus(`✅ ${data.message}`)
//         addToHistory(textToSend, "sent")
//         setMessage("")
//         setTranscribedText("")
//       } else {
//         setError(`❌ ${data.error || "Failed to send message"}`)
//       }
//     } catch (error) {
//       setError(`❌ Network error: ${error}`)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   // Input handling
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value
//     if (value.length <= 32) {
//       setMessage(value)
//       setTranscribedText("")
//       setError("")
//     }
//   }

//   // Language change
//   const handleLanguageChange = (language: string) => {
//     setCurrentLanguage(language)
//     sttServiceRef.current?.setLanguage(language)
//     setStatus(`Language changed to ${SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name}`)
//   }

//   // Voice profile management
//   const createVoiceProfile = () => {
//     if (!newProfileName.trim() || !newProfileVoice) {
//       setError("Please provide profile name and select a voice")
//       return
//     }

//     const newProfile: VoiceProfile = {
//       id: generateId(),
//       name: newProfileName.trim(),
//       voice: newProfileVoice,
//       rate: newProfileRate[0],
//       pitch: newProfilePitch[0],
//       volume: newProfileVolume[0],
//       isDefault: voiceProfiles.length === 0,
//     }

//     setVoiceProfiles((prev) => [...prev, newProfile])
//     setNewProfileName("")
//     setNewProfileVoice("")
//     setNewProfileRate([1])
//     setNewProfilePitch([1])
//     setNewProfileVolume([0.8])
//     setShowVoiceProfileDialog(false)
//     setStatus("Voice profile created successfully")
//   }

//   const setDefaultProfile = (profileId: string) => {
//     setVoiceProfiles((prev) =>
//       prev.map((p) => ({
//         ...p,
//         isDefault: p.id === profileId,
//       })),
//     )

//     const profile = voiceProfiles.find((p) => p.id === profileId)
//     if (profile && ttsServiceRef.current) {
//       setCurrentProfile(profile)
//       ttsServiceRef.current.setVoiceProfile(profile)
//       setStatus(`Set "${profile.name}" as default voice profile`)
//     }
//   }

//   const deleteProfile = (profileId: string) => {
//     setVoiceProfiles((prev) => prev.filter((p) => p.id !== profileId))
//     if (currentProfile?.id === profileId) {
//       setCurrentProfile(null)
//     }
//   }

//   // History management
//   const clearHistory = () => {
//     setSpeechHistory([])
//     setStatus("Speech history cleared")
//   }

//   const replayHistoryItem = (item: SpeechHistoryItem) => {
//     setMessage(item.text)
//     if (item.type === "transcribed" || item.type === "spoken") {
//       speakText(item.text)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header */}
//         <Card>
//           <CardHeader className="text-center">
//             <CardTitle className="flex items-center justify-center gap-2 text-3xl">
//               <Monitor className="h-8 w-8" />
//               Advanced Arduino LCD Controller
//             </CardTitle>
//             <CardDescription className="text-lg">
//               Professional voice-enabled interface with multi-language support, voice profiles, and command recognition
//             </CardDescription>
//           </CardHeader>
//         </Card>

//         {/* Status Bar */}
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex flex-wrap items-center justify-between gap-4">
//               <div className="flex flex-wrap gap-2">
//                 <Badge variant={speechSupport.recognition ? "default" : "destructive"}>
//                   <Mic className="h-3 w-3 mr-1" />
//                   STT: {speechSupport.recognition ? "Ready" : "Unavailable"}
//                 </Badge>
//                 <Badge variant={speechSupport.synthesis ? "default" : "destructive"}>
//                   <Volume2 className="h-3 w-3 mr-1" />
//                   TTS: {speechSupport.synthesis ? "Ready" : "Unavailable"}
//                 </Badge>
//                 <Badge variant={isOnlineMode ? "default" : "secondary"}>
//                   {isOnlineMode ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
//                   {isOnlineMode ? "Online" : "Offline"}
//                 </Badge>
//                 <Badge variant={micPermission ? "default" : "destructive"}>
//                   <Mic className="h-3 w-3 mr-1" />
//                   Mic: {micPermission ? "Permitted" : "Denied"}
//                 </Badge>
//               </div>

//               <div className="flex gap-2">
//                 <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
//                   <DialogTrigger asChild>
//                     <Button variant="outline" size="sm">
//                       <Settings className="h-4 w-4 mr-2" />
//                       Settings
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle>Advanced Settings</DialogTitle>
//                       <DialogDescription>Configure speech recognition and synthesis options</DialogDescription>
//                     </DialogHeader>
//                     <Tabs defaultValue="general" className="w-full">
//                       <TabsList className="grid w-full grid-cols-3">
//                         <TabsTrigger value="general">General</TabsTrigger>
//                         <TabsTrigger value="language">Language</TabsTrigger>
//                         <TabsTrigger value="commands">Commands</TabsTrigger>
//                       </TabsList>

//                       <TabsContent value="general" className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <Label htmlFor="auto-speak">Auto-speak transcribed text</Label>
//                           <Switch
//                             id="auto-speak"
//                             checked={autoSpeakTranscribed}
//                             onCheckedChange={setAutoSpeakTranscribed}
//                           />
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <Label htmlFor="voice-commands">Enable voice commands</Label>
//                           <Switch
//                             id="voice-commands"
//                             checked={voiceCommandsEnabled}
//                             onCheckedChange={setVoiceCommandsEnabled}
//                           />
//                         </div>
//                       </TabsContent>

//                       <TabsContent value="language" className="space-y-4">
//                         <div>
//                           <Label>Speech Recognition Language</Label>
//                           <Select value={currentLanguage} onValueChange={handleLanguageChange}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {SUPPORTED_LANGUAGES.map((lang) => (
//                                 <SelectItem key={lang.code} value={lang.code}>
//                                   {lang.flag} {lang.name}
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </TabsContent>

//                       <TabsContent value="commands" className="space-y-4">
//                         <div>
//                           <h4 className="font-semibold mb-2">Available Voice Commands</h4>
//                           <ScrollArea className="h-48">
//                             <div className="space-y-2">
//                               {VOICE_COMMANDS.map((cmd) => (
//                                 <div key={cmd.command} className="p-2 border rounded">
//                                   <div className="font-medium">{cmd.description}</div>
//                                   <div className="text-sm text-muted-foreground">Say: {cmd.patterns.join(", ")}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           </ScrollArea>
//                         </div>
//                       </TabsContent>
//                     </Tabs>
//                   </DialogContent>
//                 </Dialog>

//                 <Dialog open={showVoiceProfileDialog} onOpenChange={setShowVoiceProfileDialog}>
//                   <DialogTrigger asChild>
//                     <Button variant="outline" size="sm">
//                       <User className="h-4 w-4 mr-2" />
//                       Voice Profiles
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-3xl">
//                     <DialogHeader>
//                       <DialogTitle>Voice Profiles</DialogTitle>
//                       <DialogDescription>Create and manage custom voice profiles for text-to-speech</DialogDescription>
//                     </DialogHeader>
//                     <Tabs defaultValue="profiles" className="w-full">
//                       <TabsList className="grid w-full grid-cols-2">
//                         <TabsTrigger value="profiles">Manage Profiles</TabsTrigger>
//                         <TabsTrigger value="create">Create New</TabsTrigger>
//                       </TabsList>

//                       <TabsContent value="profiles" className="space-y-4">
//                         <ScrollArea className="h-64">
//                           <div className="space-y-2">
//                             {voiceProfiles.map((profile) => (
//                               <div key={profile.id} className="flex items-center justify-between p-3 border rounded">
//                                 <div>
//                                   <div className="font-medium flex items-center gap-2">
//                                     {profile.name}
//                                     {profile.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
//                                   </div>
//                                   <div className="text-sm text-muted-foreground">
//                                     Voice: {profile.voice} | Rate: {profile.rate} | Pitch: {profile.pitch}
//                                   </div>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     onClick={() => setDefaultProfile(profile.id)}
//                                     disabled={profile.isDefault}
//                                   >
//                                     {profile.isDefault ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
//                                   </Button>
//                                   <Button
//                                     size="sm"
//                                     variant="outline"
//                                     onClick={() => speakText("This is a test of the voice profile")}
//                                   >
//                                     <Play className="h-4 w-4" />
//                                   </Button>
//                                   <Button size="sm" variant="destructive" onClick={() => deleteProfile(profile.id)}>
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </div>
//                               </div>
//                             ))}
//                             {voiceProfiles.length === 0 && (
//                               <div className="text-center text-muted-foreground py-8">
//                                 No voice profiles created yet
//                               </div>
//                             )}
//                           </div>
//                         </ScrollArea>
//                       </TabsContent>

//                       <TabsContent value="create" className="space-y-4">
//                         <div>
//                           <Label htmlFor="profile-name">Profile Name</Label>
//                           <Input
//                             id="profile-name"
//                             value={newProfileName}
//                             onChange={(e) => setNewProfileName(e.target.value)}
//                             placeholder="Enter profile name"
//                           />
//                         </div>

//                         <div>
//                           <Label>Voice</Label>
//                           <Select value={newProfileVoice} onValueChange={setNewProfileVoice}>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select a voice" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {ttsServiceRef.current?.getVoices().map((voice) => (
//                                 <SelectItem key={voice.name} value={voice.name}>
//                                   {voice.name} ({voice.lang})
//                                 </SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div>
//                           <Label>Rate: {newProfileRate[0]}</Label>
//                           <Slider
//                             value={newProfileRate}
//                             onValueChange={setNewProfileRate}
//                             min={0.1}
//                             max={2}
//                             step={0.1}
//                           />
//                         </div>

//                         <div>
//                           <Label>Pitch: {newProfilePitch[0]}</Label>
//                           <Slider
//                             value={newProfilePitch}
//                             onValueChange={setNewProfilePitch}
//                             min={0}
//                             max={2}
//                             step={0.1}
//                           />
//                         </div>

//                         <div>
//                           <Label>Volume: {newProfileVolume[0]}</Label>
//                           <Slider
//                             value={newProfileVolume}
//                             onValueChange={setNewProfileVolume}
//                             min={0}
//                             max={1}
//                             step={0.1}
//                           />
//                         </div>

//                         <div className="flex gap-2">
//                           <Button onClick={createVoiceProfile} className="flex-1">
//                             <Save className="h-4 w-4 mr-2" />
//                             Create Profile
//                           </Button>
//                           {newProfileVoice && (
//                             <Button
//                               variant="outline"
//                               onClick={() => {
//                                 const voice = ttsServiceRef.current?.getVoices().find((v) => v.name === newProfileVoice)
//                                 if (voice && ttsServiceRef.current) {
//                                   ttsServiceRef.current.speak("This is a preview of the voice settings", {
//                                     voice,
//                                     rate: newProfileRate[0],
//                                     pitch: newProfilePitch[0],
//                                     volume: newProfileVolume[0],
//                                   })
//                                 }
//                               }}
//                             >
//                               <Play className="h-4 w-4 mr-2" />
//                               Test
//                             </Button>
//                           )}
//                         </div>
//                       </TabsContent>
//                     </Tabs>
//                   </DialogContent>
//                 </Dialog>

//                 <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
//                   <DialogTrigger asChild>
//                     <Button variant="outline" size="sm">
//                       <History className="h-4 w-4 mr-2" />
//                       History ({speechHistory.length})
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="max-w-2xl">
//                     <DialogHeader>
//                       <DialogTitle>Speech History</DialogTitle>
//                       <DialogDescription>View and replay your speech interactions</DialogDescription>
//                     </DialogHeader>
//                     <div className="flex justify-between items-center mb-4">
//                       <div className="flex gap-2">
//                         <Badge variant="outline">Total: {speechHistory.length}</Badge>
//                         <Badge variant="outline">
//                           Transcribed: {speechHistory.filter((h) => h.type === "transcribed").length}
//                         </Badge>
//                         <Badge variant="outline">
//                           Spoken: {speechHistory.filter((h) => h.type === "spoken").length}
//                         </Badge>
//                         <Badge variant="outline">Sent: {speechHistory.filter((h) => h.type === "sent").length}</Badge>
//                       </div>
//                       <Button variant="destructive" size="sm" onClick={clearHistory}>
//                         <Trash2 className="h-4 w-4 mr-2" />
//                         Clear All
//                       </Button>
//                     </div>
//                     <ScrollArea className="h-96">
//                       <div className="space-y-2">
//                         {speechHistory
//                           .slice()
//                           .reverse()
//                           .map((item) => (
//                             <div key={item.id} className="flex items-center justify-between p-3 border rounded">
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <Badge
//                                     variant={
//                                       item.type === "transcribed"
//                                         ? "default"
//                                         : item.type === "spoken"
//                                           ? "secondary"
//                                           : "destructive"
//                                     }
//                                   >
//                                     {item.type === "transcribed" && <Mic className="h-3 w-3 mr-1" />}
//                                     {item.type === "spoken" && <Volume2 className="h-3 w-3 mr-1" />}
//                                     {item.type === "sent" && <Send className="h-3 w-3 mr-1" />}
//                                     {item.type}
//                                   </Badge>
//                                   <span className="text-xs text-muted-foreground">
//                                     <Clock className="h-3 w-3 inline mr-1" />
//                                     {item.timestamp.toLocaleTimeString()}
//                                   </span>
//                                   {item.confidence && (
//                                     <span className="text-xs text-muted-foreground">
//                                       Confidence: {Math.round(item.confidence * 100)}%
//                                     </span>
//                                   )}
//                                 </div>
//                                 <div className="font-mono text-sm">{item.text}</div>
//                               </div>
//                               <Button size="sm" variant="outline" onClick={() => replayHistoryItem(item)}>
//                                 <RotateCcw className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           ))}
//                         {speechHistory.length === 0 && (
//                           <div className="text-center text-muted-foreground py-8">No speech history yet</div>
//                         )}
//                       </div>
//                     </ScrollArea>
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Main Control Panel */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <MessageSquare className="h-5 w-5" />
//               Message Control Center
//             </CardTitle>
//             <CardDescription>
//               Current Language: {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.flag}{" "}
//               {SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage)?.name}
//               {currentProfile && ` | Voice Profile: ${currentProfile.name}`}
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Speech Recognition Section */}
//             {speechSupport.recognition && (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold flex items-center gap-2">
//                     <Waves className="h-4 w-4" />
//                     Speech Recognition
//                     {voiceCommandsEnabled && (
//                       <Badge variant="secondary">
//                         <Command className="h-3 w-3 mr-1" />
//                         Voice Commands Active
//                       </Badge>
//                     )}
//                   </h3>
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={startListening}
//                       disabled={isListening || !micPermission}
//                       variant={isListening ? "destructive" : "default"}
//                       size="sm"
//                     >
//                       {isListening ? (
//                         <>
//                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                           Listening...
//                         </>
//                       ) : (
//                         <>
//                           <Mic className="h-4 w-4 mr-2" />
//                           Start Listening
//                         </>
//                       )}
//                     </Button>
//                     {isListening && (
//                       <Button onClick={stopListening} variant="outline" size="sm">
//                         <MicOff className="h-4 w-4 mr-2" />
//                         Stop
//                       </Button>
//                     )}
//                   </div>
//                 </div>

//                 {/* Live Transcript Display */}
//                 {(interimTranscript || transcribedText) && (
//                   <div className="p-4 bg-muted rounded-lg">
//                     <p className="text-sm text-muted-foreground mb-1">
//                       {isListening ? "Live Transcript:" : "Final Transcript:"}
//                     </p>
//                     <p className="font-mono">
//                       {transcribedText && <span className="text-green-600 font-semibold">{transcribedText}</span>}
//                       {interimTranscript && <span className="text-blue-500 italic">{interimTranscript}</span>}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}

//             <Separator />

//             {/* Text Input Section */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <label htmlFor="message" className="text-sm font-medium">
//                   Message Text
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="message"
//                     type="text"
//                     value={message}
//                     onChange={handleInputChange}
//                     placeholder="Type your message here (max 32 characters)"
//                     className="pr-16"
//                     maxLength={32}
//                   />
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
//                     {message.length}/32
//                   </div>
//                 </div>
//                 {transcribedText && message === transcribedText && (
//                   <p className="text-xs text-blue-600 flex items-center gap-1">
//                     <Mic className="h-3 w-3" />
//                     This text was transcribed from speech
//                   </p>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-wrap gap-3">
//                 {/* Text-to-Speech Button */}
//                 {speechSupport.synthesis && (
//                   <Button
//                     type="button"
//                     onClick={() => speakText(message)}
//                     disabled={!message.trim() || isSpeaking}
//                     variant="outline"
//                   >
//                     {isSpeaking ? (
//                       <>
//                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                         Speaking...
//                       </>
//                     ) : (
//                       <>
//                         <Volume2 className="h-4 w-4 mr-2" />
//                         Read Aloud
//                       </>
//                     )}
//                   </Button>
//                 )}

//                 {/* Stop Speaking Button */}
//                 {isSpeaking && (
//                   <Button type="button" onClick={stopSpeaking} variant="outline">
//                     <VolumeX className="h-4 w-4 mr-2" />
//                     Stop Speaking
//                   </Button>
//                 )}

//                 {/* Clear Button */}
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setMessage("")
//                     setTranscribedText("")
//                     setInterimTranscript("")
//                   }}
//                   variant="outline"
//                   disabled={!message.trim()}
//                 >
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Clear
//                 </Button>

//                 {/* Send to Arduino Button */}
//                 <Button type="submit" disabled={!message.trim() || isSubmitting} className="flex-1 min-w-[200px]">
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Sending...
//                     </>
//                   ) : (
//                     <>
//                       <Send className="h-4 w-4 mr-2" />
//                       Send to LCD
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Status and Error Display */}
//         {(status || error) && (
//           <Card>
//             <CardContent className="pt-6">
//               {error && (
//                 <Alert variant="destructive" className="mb-4">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               {status && !error && (
//                 <Alert>
//                   <CheckCircle className="h-4 w-4" />
//                   <AlertDescription>{status}</AlertDescription>
//                 </Alert>
//               )}
//             </CardContent>
//           </Card>
//         )}

//         {/* Quick Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-2xl font-bold">{speechHistory.filter((h) => h.type === "transcribed").length}</div>
//               <p className="text-xs text-muted-foreground">Messages Transcribed</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-2xl font-bold">{speechHistory.filter((h) => h.type === "spoken").length}</div>
//               <p className="text-xs text-muted-foreground">Messages Spoken</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-2xl font-bold">{speechHistory.filter((h) => h.type === "sent").length}</div>
//               <p className="text-xs text-muted-foreground">Messages Sent</p>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="pt-6">
//               <div className="text-2xl font-bold">{voiceProfiles.length}</div>
//               <p className="text-xs text-muted-foreground">Voice Profiles</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
