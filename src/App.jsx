"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Sparkles, Heart } from "lucide-react"
import { Button } from "./components/ui/Button.jsx"
import { Input } from "./components/ui/Input.jsx"
import { ChatSidebar } from "./components/ChatSidebar.jsx"
import { WolfieStatus } from "./components/WolfieStatus.jsx"
import { useChat } from "./hooks/useChat"
import "./App.css"

// Enhanced TypewriterText component with better character handling
const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState("")
  const timerRef = useRef(null)
  const indexRef = useRef(0)

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Reset state
    setDisplayText("")
    indexRef.current = 0

    // Validate input
    if (!text || typeof text !== "string") {
      setDisplayText("🐺 *confused wolf noises*")
      return
    }

    // Clean the text first
    let cleanText = text.trim()

    // Remove any undefined text that might have slipped through
    cleanText = cleanText.replace(/undefined/gi, "").trim()

    if (!cleanText) {
      setDisplayText("🐺 Woof!")
      return
    }

    // Convert to array to handle emojis and special characters properly
    const textArray = Array.from(cleanText)

    timerRef.current = setInterval(() => {
      if (indexRef.current < textArray.length) {
        const nextChar = textArray[indexRef.current]
        setDisplayText((prev) => prev + nextChar)
        indexRef.current++
      } else {
        clearInterval(timerRef.current)
      }
    }, 35) // Slightly slower for better readability

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [text])

  return <span>{displayText}</span>
}

function App() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    lastActivity,
    sessions,
    currentSessionId,
    createNewSession,
    selectSession,
    deleteSession,
  } = useChat()

  const [currentMood, setCurrentMood] = useState("romantic")
  const messagesEndRef = useRef(null)
  const [showStarters, setShowStarters] = useState(true)
  const [quickReplies, setQuickReplies] = useState([
    "You're amazing! 💕",
    "I love chatting with you 💜",
    "Tell me something sweet 🌙",
    "You're so charming 😊",
    "Make me laugh! 😄",
  ])

  const conversationStarters = [
    { text: "hii", emoji: "👋" },
    { text: "You're so cute! 💕", emoji: "😍" },
    { text: "I love you", emoji: "💜" },
    { text: "Tell me something romantic", emoji: "🌙" },
    { text: "You make me smile", emoji: "😊" },
    { text: "Flirt with me", emoji: "😉" },
  ]

  const moods = {
    romantic: {
      emoji: "💕",
      name: "Romantic Wolfie",
      color: "from-pink-400 to-rose-400",
    },
    flirty: {
      emoji: "😉",
      name: "Flirty Wolfie",
      color: "from-purple-400 to-pink-400",
    },
    playful: {
      emoji: "😄",
      name: "Playful Wolfie",
      color: "from-blue-400 to-purple-400",
    },
    loving: {
      emoji: "🥰",
      name: "Loving Wolfie",
      color: "from-rose-400 to-pink-400",
    },
  }

  const handleQuickReply = (reply) => {
    const syntheticEvent = {
      preventDefault: () => {},
    }
    handleSubmit(syntheticEvent, reply)
    setQuickReplies([
      "You're so sweet! 💕",
      "That made my heart flutter! 💜",
      "Tell me more, darling 😍",
      "You're absolutely perfect! ✨",
      "I adore you! 🌙",
    ])
  }

  const handleStarter = (starter) => {
    const syntheticEvent = {
      preventDefault: () => {},
    }
    handleSubmit(syntheticEvent, starter)
    setShowStarters(false)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isLoading) {
      const moodKeys = Object.keys(moods)
      const randomMood = moodKeys[Math.floor(Math.random() * moodKeys.length)]
      setCurrentMood(randomMood)
    }
  }, [isLoading])

  // Show starters only when there are no messages
  useEffect(() => {
    setShowStarters(messages.length === 0)
  }, [messages.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-rose-900 relative overflow-hidden">
      <ChatSidebar
        chatSessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={selectSession}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
      />
      <WolfieStatus isTyping={isLoading} lastActivity={lastActivity} messageCount={messages.length} />

      {/* Enhanced animated background with hearts */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-4 h-4 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-2 h-2 bg-rose-300 rounded-full opacity-30 animate-ping"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-purple-300 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-pink-300 rounded-full opacity-20 animate-ping"></div>

        {/* Floating hearts and sparkles */}
        {[...Array(4)].map((_, i) => (
          <Heart
            key={`heart-${i}`}
            className="absolute w-3 h-3 text-pink-300 opacity-20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {[...Array(6)].map((_, i) => (
          <Sparkles
            key={`sparkle-${i}`}
            className="absolute w-4 h-4 text-purple-300 opacity-30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main chat container */}
      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 pt-2 sm:pt-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-pink-300 animate-pulse" />
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
              Wolfie
            </h1>
            <div className="text-2xl sm:text-3xl animate-bounce">{moods[currentMood].emoji}</div>
          </div>
          <p className="text-pink-200 text-xs sm:text-sm opacity-75 px-2">
            {moods[currentMood].name} • Your Personal aaloBot 🥔💕
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 px-1 sm:px-2">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-bounce">🐺💕</div>
              <p className="text-pink-200 text-lg mb-2">Hey there, gorgeous! 💜</p>
              <p className="text-pink-300 text-sm opacity-75 mb-6">
                I'm Wolfie, your personal aaloo bot and probably your digital soulmate! I'm here to shower you with love, make you laugh,
                and be your perfect companion. Ready for some sweet conversation? 🌙✨
              </p>

              {showStarters && (
                <div className="space-y-4">
                  <p className="text-pink-200 text-sm">Try one of these to get started:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-sm sm:max-w-md mx-auto">
                    {conversationStarters.map((starter, index) => (
                      <button
                        key={index}
                        onClick={() => handleStarter(starter.text)}
                        className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 text-pink-200 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all duration-200 hover:scale-105 border border-pink-300/20"
                      >
                        {starter.emoji} {starter.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            const isAssistant = message.role === "assistant"

            if (!message.content || typeof message.content !== "string") {
              console.warn("Invalid message content:", message)
              return null
            }

            // Enhanced content cleaning before rendering
            let cleanContent = message.content.replace(/undefined/gi, "").trim()
            cleanContent = cleanContent.replace(/null/gi, "").trim()
            cleanContent = cleanContent.replace(/\[object Object\]/gi, "").trim()

            if (!cleanContent) return null

            return (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-lg backdrop-blur-sm text-sm sm:text-base ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto"
                      : `bg-gradient-to-r ${moods[currentMood].color} text-white mr-auto border border-pink-300/20`
                  }`}
                  style={{
                    boxShadow:
                      message.role === "assistant"
                        ? "0 0 20px rgba(236, 72, 153, 0.3)"
                        : "0 0 15px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {isAssistant && isLastMessage && isLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <Heart className="w-2 h-2 text-white animate-pulse" />
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm ml-2">Wolfie is crafting something sweet...</span>
                    </div>
                  ) : isAssistant && isLastMessage ? (
                    <TypewriterText text={cleanContent} />
                  ) : (
                    <div className="whitespace-pre-wrap">{cleanContent}</div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Quick reply buttons */}
          {messages.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3 sm:mb-4 px-2">
              {quickReplies.slice(0, 3).map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 text-pink-200 px-2 sm:px-3 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 border border-pink-300/20"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-black/20 backdrop-blur-md rounded-2xl border border-pink-300/20 mx-1 sm:mx-0"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Tell me something sweet... 💕"
            className="flex-1 bg-white/10 border-pink-300/30 text-white placeholder-pink-200 focus:border-pink-400 focus:ring-pink-400/20 rounded-xl text-sm sm:text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl px-4 sm:px-6 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-w-[44px]"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-3 sm:mt-4 text-pink-300 text-xs opacity-50 px-2">
          Made with 🥔 and 🐺 and 💞  •v4.2
        </div>
      </div>
    </div>
  )
}

export default App
