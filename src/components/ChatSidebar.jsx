"use client"

import { useState } from "react"
import { MessageCircle, Trash2, Plus } from "lucide-react"
import { Button } from "./ui/Button.jsx"

export function ChatSidebar({ chatSessions, currentSessionId, onSessionSelect, onNewChat, onDeleteSession }) {
  const [isOpen, setIsOpen] = useState(false)

  const formatLastMessage = (message) => {
    if (!message) return "New conversation"
    // Remove emojis and truncate for cleaner display
    const cleanMessage = message.replace(/[^\w\s!?.,]/g, "").trim()
    return cleanMessage.length > 50 ? cleanMessage.substring(0, 50) + "..." : cleanMessage
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffInHours = (now - messageTime) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60))
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return messageTime.toLocaleDateString()
    }
  }

  const generateSessionTitle = (messages) => {
    if (!messages || messages.length === 0) return "New Chat"

    // Find the first user message
    const firstUserMessage = messages.find((msg) => msg.role === "user")
    if (!firstUserMessage) return "New Chat"

    const message = firstUserMessage.content.toLowerCase()

    // Generate contextual titles based on message content
    if (message.includes("hii") || message === "hii") return "First howl with Wolfie 🐺"
    if (message.includes("advice") || message.includes("help")) return "Seeking wolf wisdom 🎯"
    if (message.includes("sad") || message.includes("down")) return "Heart-to-heart chat 💙"
    if (message.includes("joke") || message.includes("funny")) return "Comedy hour with Wolfie 😄"
    if (message.includes("work") || message.includes("job")) return "Work life discussion 💼"
    if (message.includes("relationship") || message.includes("love")) return "Relationship talk 💜"
    if (message.includes("favorite") || message.includes("fav")) return "Getting to know each other ✨"
    if (message.includes("how are you")) return "Checking in with Wolfie 🌙"

    // Default title based on first few words
    const words = firstUserMessage.content.split(" ").slice(0, 3).join(" ")
    return words.length > 20 ? words.substring(0, 20) + "..." : words
  }

  return (
    <>
      {/* Sidebar toggle button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-2 transition-all duration-200 hover:scale-105"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 sm:w-80 bg-black/40 backdrop-blur-md border-r border-purple-300/20 transform transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 sm:p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6 mt-12 sm:mt-12">
            <h2 className="text-lg sm:text-xl font-bold text-purple-200">Chat History</h2>
            <Button
              onClick={onNewChat}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {chatSessions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐺</div>
                <p className="text-purple-300 text-sm opacity-75">No chat history yet</p>
                <p className="text-purple-400 text-xs opacity-50">Start a conversation to see it here!</p>
              </div>
            ) : (
              chatSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    onSessionSelect(session.id)
                    setIsOpen(false)
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border group relative ${
                    currentSessionId === session.id
                      ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-300/30"
                      : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-purple-200 font-medium text-sm mb-1 truncate">
                        {generateSessionTitle(session.messages)}
                      </h3>
                      <p className="text-purple-300 text-xs opacity-75 line-clamp-2">
                        {formatLastMessage(session.lastMessage)}
                      </p>
                      <p className="text-purple-400 text-xs mt-1 opacity-50">{formatTimestamp(session.timestamp)}</p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      size="sm"
                      variant="ghost"
                      className="opacity-100 transition-opacity text-purple-300 hover:text-red-400 flex-shrink-0 min-w-[32px] h-8 w-8 p-1 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-purple-300/20">
            <p className="text-purple-400 text-xs opacity-50 text-center px-2">
              {chatSessions.length} conversation{chatSessions.length !== 1 ? "s" : ""} with Wolfie 🐺
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setIsOpen(false)} />}
    </>
  )
}
