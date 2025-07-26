"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Cloud, Star } from "lucide-react"

export function WolfieStatus({ isTyping, lastActivity, messageCount }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [wolfieActivity, setWolfieActivity] = useState("Prowling the digital forest")

  const activities = [
    "Howling at the digital moon 🌙",
    "Prowling the digital forest 🌲",
    "Sharpening her wit 🗡️",
    "Collecting moonbeams ✨",
    "Planning her next sarcastic comment 😏",
    "Guarding the chat realm 🛡️",
    "Hunting for good vibes 🎯",
    "Reading between the lines 📖",
    "Channeling wolf wisdom 🧠",
    "Preparing witty comebacks 💫",
  ]

  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentTime(new Date())

        // Change activity more frequently when actively chatting
        const changeChance = messageCount > 0 ? 0.4 : 0.2
        if (Math.random() < changeChance) {
          setWolfieActivity(activities[Math.floor(Math.random() * activities.length)])
        }
      },
      isTyping ? 2000 : 5000,
    ) // Faster updates when typing

    return () => clearInterval(timer)
  }, [isTyping, messageCount])

  // Update activity based on chat state
  useEffect(() => {
    if (isTyping) {
      setWolfieActivity("Crafting the perfect response ✨")
    }
  }, [isTyping])

  const getTimeIcon = () => {
    const hour = currentTime.getHours()
    if (hour >= 6 && hour < 12) return <Sun className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
    if (hour >= 12 && hour < 18) return <Cloud className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
    if (hour >= 18 && hour < 22) return <Moon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
    return <Star className="w-3 h-3 sm:w-4 sm:h-4 text-purple-300" />
  }

  const getStatusColor = () => {
    if (isTyping) return "text-yellow-400"
    if (lastActivity && Date.now() - lastActivity < 30000) return "text-green-400"
    return "text-green-400"
  }

  const getStatusText = () => {
    if (isTyping) return "Typing..."
    if (messageCount === 0) return "Ready to Chat"
    if (lastActivity && Date.now() - lastActivity < 10000) return "Just responded"
    return "Online & Ready"
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
      {/* Left side - Status and activity */}
      <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
        {getTimeIcon()}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-purple-200 text-xs sm:text-sm font-medium">Wolfie</span>
            <div
              className={`w-2 h-2 rounded-full ${isTyping ? "bg-yellow-400 animate-pulse" : "bg-green-400 animate-pulse"}`}
            ></div>
            <span className={`text-xs ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
          <p className="text-purple-300 text-xs opacity-75 truncate">{wolfieActivity}</p>
        </div>
      </div>

      {/* Right side - Message count */}
      {messageCount > 0 && (
        <div className="text-purple-400 text-xs opacity-50 whitespace-nowrap">
          {messageCount} msg{messageCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
