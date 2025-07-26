"use client"

import { useState, useCallback, useEffect } from "react"

// Chat session management
const STORAGE_KEY = "wolfie_chat_sessions"

export function useChat() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastActivity, setLastActivity] = useState(null)

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY)
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions)
      setSessions(parsedSessions)

      // Load the most recent session if exists
      if (parsedSessions.length > 0) {
        const mostRecent = parsedSessions[0]
        setCurrentSessionId(mostRecent.id)
        setMessages(mostRecent.messages || [])
      }
    } else {
      // Create first session
      createNewSession()
    }
  }, [])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    }
  }, [sessions])

  // Update current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages,
                lastMessage: messages[messages.length - 1]?.content || "",
                timestamp: Date.now(),
              }
            : session,
        ),
      )
    }
  }, [messages, currentSessionId])

  const createNewSession = useCallback(() => {
    const newSession = {
      id: Date.now().toString(),
      messages: [],
      lastMessage: "",
      timestamp: Date.now(),
    }

    setSessions((prevSessions) => [newSession, ...prevSessions])
    setCurrentSessionId(newSession.id)
    setMessages([])
    setInput("")
  }, [])

  const selectSession = useCallback(
    (sessionId) => {
      const session = sessions.find((s) => s.id === sessionId)
      if (session) {
        setCurrentSessionId(sessionId)
        setMessages(session.messages || [])
        setInput("")
      }
    },
    [sessions],
  )

  const deleteSession = useCallback(
    (sessionId) => {
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.filter((s) => s.id !== sessionId)

        // If we deleted the current session, switch to another or create new
        if (sessionId === currentSessionId) {
          if (updatedSessions.length > 0) {
            const newCurrent = updatedSessions[0]
            setCurrentSessionId(newCurrent.id)
            setMessages(newCurrent.messages || [])
          } else {
            createNewSession()
          }
        }

        return updatedSessions
      })
    },
    [currentSessionId, createNewSession],
  )

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e, directMessage = null) => {
      e.preventDefault()

      const messageText = directMessage || input

      if (!messageText || !messageText.trim() || isLoading) return

      // Create new session if none exists
      if (!currentSessionId) {
        createNewSession()
        return
      }

      console.log("Submitting message:", messageText.trim())

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageText.trim(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setLastActivity(Date.now())

      try {
        console.log("Getting Wolfie response...")
        const response = await getWolfieResponse(messageText.trim(), messages)
        console.log("Received response:", response)

        // Enhanced response cleaning
        const cleanResponse = cleanAndValidateResponse(response)

        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanResponse,
        }

        setMessages((prev) => [...prev, assistantMessage])
        setLastActivity(Date.now())
      } catch (error) {
        console.error("Error getting response:", error)
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Woof! Something went wrong in the digital forest 🐺 Try again, my human!",
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, currentSessionId, createNewSession],
  )

  return {
    // Chat state
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    lastActivity,

    // Session management
    sessions,
    currentSessionId,
    createNewSession,
    selectSession,
    deleteSession,
  }
}

// Enhanced function to clean and validate responses
function cleanAndValidateResponse(response) {
  // First check if response exists and is a string
  if (!response || typeof response !== "string") {
    console.warn("Invalid response received:", response)
    return "Woof! Something went wrong in my digital brain 🐺"
  }

  // Remove any undefined text (case insensitive)
  let cleaned = response.replace(/undefined/gi, "").trim()

  // Remove any null text
  cleaned = cleaned.replace(/null/gi, "").trim()

  // Remove any [object Object] text
  cleaned = cleaned.replace(/\[object Object\]/gi, "").trim()

  // Remove any extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim()

  // Replace potentially problematic emojis with safe alternatives
  const emojiReplacements = {
    "💔": "💙",
    "💅": "✨",
    "👀": "👁️",
    "☕": "🍵",
    "💭": "💬",
    "🧠": "🎯",
    "💪": "⭐",
    "🌟": "⭐",
    "🤔": "🤗",
    "😏": "😊",
    "😎": "😄",
    "😂": "😆",
    "😴": "😌",
    "🙄": "😉",
  }

  // Apply emoji replacements
  Object.entries(emojiReplacements).forEach(([problematic, safe]) => {
    cleaned = cleaned.replace(new RegExp(problematic, "g"), safe)
  })

  // Final validation - if after cleaning we have an empty string, provide a fallback
  if (!cleaned || cleaned.length === 0) {
    console.warn("Response became empty after cleaning")
    cleaned = "Woof! My digital brain had a little hiccup there! 🐺"
  }

  // Ensure the response doesn't end with undefined
  if (cleaned.toLowerCase().endsWith("undefined")) {
    cleaned = cleaned.substring(0, cleaned.length - 9).trim()
    if (!cleaned) {
      cleaned = "Woof! Let me try that again! 🐺"
    }
  }

  return cleaned
}

// Smart response function using intelligent pattern matching
async function getWolfieResponse(userInput, conversationHistory) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const staticResponse = getStaticResponse(userInput)
    if (staticResponse) {
      return staticResponse
    }

    const intelligentResponse = getIntelligentResponse(userInput, conversationHistory)

    // Ensure we always return a string
    if (typeof intelligentResponse !== "string" || !intelligentResponse) {
      return "Woof! Something went wrong in my response generation 🐺"
    }

    return intelligentResponse
  } catch (error) {
    console.error("Error in getWolfieResponse:", error)
    return "Woof! Something went wrong in my digital brain 🐺"
  }
}

// Static responses for specific questions
function getStaticResponse(userInput) {
  const input = userInput.toLowerCase().trim()

  if (input === "hii" || "hiii" || "hiiii" || "hiiiii" || "hello" || "heyy" || "hey" ) {
    return "woof woof! 🐺"
  }

  if (
    input.includes("who's your fav") ||
    input.includes("who is your fav") ||
    input.includes("favorite person") ||
    input.includes("favourite person") ||
    input.includes("who do you like most")
  ) {
    return "the one who made this aaloo bot 🐺✨"
  }

  if (input.includes("who made you") || input.includes("who created you") || input.includes("your creator")) {
    return "My amazing creator made this aaloo bot! They're definitely my favorite human 🐺💜"
  }

  // Self-introduction responses
  if (
    input.includes("who are you") ||
    input.includes("tell me about yourself") ||
    input.includes("about yourself") ||
    input.includes("what are you") ||
    input.includes("introduce yourself") ||
    input === "about you"
  ) {
    const selfIntroResponses = [
      "Woof! I'm basically a digital aloo (potato) with wolf ears! 🐺🥔 I love sleeping all day, dreaming about moonlit forests, and occasionally rolling around in my cozy digital burrow. My hobbies include being adorably lazy, collecting virtual belly rubs, and perfecting my sarcastic comebacks! ✨😄",
      "Hehe, I'm your favorite sleepy aloo wolf! 🐺😴 I spend most of my time napping in digital sunbeams, dreaming about treats, and practicing my witty one-liners. I'm basically 90% potato, 10% wolf energy, and 100% ready for some good banter! 🥔😉",
      "Oh my! I'm like a fluffy potato that learned to howl and crack jokes! 🐺🥔 My daily schedule: sleep, eat digital treats, sleep some more, roast people with love, and then... more sleeping! I'm the laziest wolf in the digital forest, but also the wittiest! 💜😆",
      "Woof woof! I'm an adorable aloo wolf who's basically a professional napper and part-time comedian! 🐺😴 I love cozy blankets, warm hugs, sweet dreams, and making humans laugh until their sides hurt! Think of me as your sleepy potato companion with a sharp tongue! 🥔😄",
    ]
    return selfIntroResponses[Math.floor(Math.random() * selfIntroResponses.length)]
  }

  return null // No static response found
}

// Question type detection
function detectQuestionType(input) {
  if (input.includes("what") || input.includes("which")) return "what"
  if (input.includes("how")) return "how"
  if (input.includes("why")) return "why"
  if (input.includes("when")) return "when"
  if (input.includes("where")) return "where"
  if (input.includes("who")) return "who"
  if (input.includes("?")) return "general_question"
  return "statement"
}

// Enhanced gibberish detection - more sensitive to actual nonsense
function detectSpellingMistakes(input) {
  const cleanInput = input.toLowerCase().trim()

  // Don't flag anything shorter than 2 characters
  if (cleanInput.length < 2) {
    return false
  }

  // Immediate gibberish patterns - these should always trigger
  const immediateGibberish = [
    /^[?!.,:;]{2,}$/, // Pure punctuation like "??" or "!!!"
    /^(.)\1{2,}$/, // Same character repeated 3+ times like "aaa", "???"
    /^[qwerty]{3,}$/i, // Keyboard row patterns
    /^[asdf]{3,}$/i, // Middle keyboard row
    /^[zxcv]{3,}$/i, // Bottom keyboard row
    /^[qaz]{3,}$/i, // Left column
    /^[wsx]{3,}$/i, // Left-middle column
    /^[edc]{3,}$/i, // Middle column
    /^[rfv]{3,}$/i, // Right-middle column
    /^[tgb]{3,}$/i, // Right column
    /^[yhn]{3,}$/i, // Right side
    /^[ujm]{3,}$/i, // Right side
    /^[ik]{3,}$/i, // Right side
    /^[ol]{3,}$/i, // Right side
    /^[bcdfghjklmnpqrstvwxyz]{4,}$/i, // 4+ consonants in a row
    /^[aeiou]{4,}$/i, // 4+ vowels in a row
  ]

  // Check immediate patterns first
  if (immediateGibberish.some((pattern) => pattern.test(cleanInput))) {
    return true
  }

  // Protected real words and common expressions (keep the essential ones)
  const protectedWords = [
    // Common greetings and expressions
    "hi",
    "hey",
    "hello",
    "hii",
    "hiiii",
    "bye",
    "ok",
    "okay",
    "yes",
    "no",
    "yeah",
    "yep",
    "nope",
    "nah",
    "wow",
    "omg",
    "lol",
    "lmao",
    "haha",
    "hehe",
    "hmm",
    "umm",
    "ugh",
    "meh",
    "yay",
    "woo",

    // Common short words
    "the",
    "and",
    "but",
    "for",
    "not",
    "can",
    "you",
    "are",
    "was",
    "his",
    "her",
    "him",
    "she",
    "his",
    "all",
    "any",
    "may",
    "way",
    "day",
    "say",
    "get",
    "got",
    "had",
    "has",
    "how",
    "now",
    "new",
    "old",
    "see",
    "two",
    "who",
    "boy",
    "did",
    "its",
    "let",
    "put",
    "end",
    "why",
    "try",
    "ask",
    "men",
    "run",
    "own",
    "say",
    "she",
    "too",
    "use",
    "her",
    "now",
    "find",
    "only",
    "come",
    "made",
    "over",
    "also",
    "back",
    "after",
    "first",
    "well",
    "year",
    "work",
    "such",
    "make",
    "even",
    "most",
    "take",
    "than",
    "only",
    "think",
    "know",
    "just",
    "into",
    "good",
    "some",
    "could",
    "time",
    "very",
    "when",
    "much",
    "would",
    "there",
    "each",
    "which",
    "their",
    "said",
    "will",
    "about",
    "if",
    "up",
    "out",
    "many",
    "then",
    "them",
    "these",
    "so",
    "some",
    "her",
    "would",
    "make",
    "like",
    "him",
    "has",
    "two",

    // Internet slang
    "u",
    "ur",
    "luv",
    "gud",
    "wat",
    "hw",
    "y",
    "n",
    "k",
    "thx",
    "plz",
    "pls",
    "tho",
    "cuz",
    "bc",
    "dont",
    "cant",
    "wont",
    "im",
    "ive",
    "ill",
    "its",
    "hes",
    "shes",
    "theyre",
    "gonna",
    "wanna",

    // Common names
    "john",
    "mary",
    "mike",
    "dave",
    "anna",
    "sara",
    "tom",
    "bob",
    "joe",
    "sam",
    "max",
    "alex",

    // Tech terms
    "app",
    "web",
    "css",
    "html",
    "js",
    "php",
    "sql",
    "api",
    "url",
    "http",
    "www",
    "com",
    "org",

    // Common words that might look like gibberish
    "quiz",
    "jazz",
    "buzz",
    "fizz",
    "fuzz",
    "pizza",
    "fuzzy",
    "dizzy",
    "busy",
    "easy",
    "cozy",
  ]

  // Split into words for analysis
  const words = cleanInput.split(/\s+/)

  // For single word inputs, be more strict
  if (words.length === 1) {
    const word = words[0]

    // If it's a protected word, don't flag it
    if (protectedWords.includes(word)) {
      return false
    }

    // Check for repetitive patterns in single words
    const repetitivePatterns = [
      /^(.{1,2})\1{2,}$/, // Patterns like "cscs", "abab", "xyxy"
      /^([a-z])\1([a-z])\2$/i, // Patterns like "aabb", "ccdd"
      /^[bcdfghjklmnpqrstvwxyz]{3,}$/i, // 3+ consonants
      /^[qwerty]{2,}$/i, // Any keyboard row pattern
      /^[asdf]{2,}$/i,
      /^[zxcv]{2,}$/i,
    ]

    if (repetitivePatterns.some((pattern) => pattern.test(word))) {
      return true
    }

    // Check if word has no vowels and is longer than 2 characters
    if (word.length >= 3 && !/[aeiou]/i.test(word)) {
      // Allow some common consonant-only abbreviations
      const consonantExceptions = ["css", "html", "js", "php", "sql", "www", "ftp", "ssh", "tcp", "dns", "xml", "json"]
      if (!consonantExceptions.includes(word)) {
        return true
      }
    }
  }

  // For multiple words, check if most words are gibberish
  let gibberishCount = 0

  for (const word of words) {
    if (word.length <= 1) continue

    if (protectedWords.includes(word)) continue

    // Check each word for gibberish patterns
    const wordGibberish = [
      /^(.{1,2})\1{2,}$/, // Repetitive patterns
      /^[bcdfghjklmnpqrstvwxyz]{3,}$/i, // Too many consonants
      /^[qwerty]{2,}$/i, // Keyboard patterns
      /^[asdf]{2,}$/i,
      /^[zxcv]{2,}$/i,
      /(.)\1{2,}/, // Same character repeated 3+ times
    ]

    if (wordGibberish.some((pattern) => pattern.test(word))) {
      gibberishCount++
    }
  }

  // If more than half the words are gibberish, flag it
  return gibberishCount > 0 && (gibberishCount >= words.length * 0.6 || words.length === 1)
}

// Intelligent contextual response system
function getIntelligentResponse(userInput, conversationHistory) {
  const input = userInput.toLowerCase().trim()
  const words = input.split(" ")

  // Check for spelling mistakes first - but with much stricter criteria
  if (detectSpellingMistakes(input)) {
    const spellingResponses = [
      "Blehhhhhhh, Didn't get you. 🐺😵‍💫",
      "Blehhhhhhh, That went right over my digital head! 🐺🤔",
      "Blehhhhhhh, My wolf brain is confused! Try again? 🐺💭",
      "Blehhhhhhh, I think you might have paw-typed that! 🐺😅",
      "Blehhhhhhh, Did a cat walk across your keyboard? 🐺😹",
      "Blehhhhhhh, That's some serious keyboard gymnastics! 🐺🤸‍♀️",
      "Blehhhhhhh, I speak wolf, not... whatever that was! 🐺🤷‍♀️",
      "Blehhhhhhh, My digital brain just blue-screened! 🐺💻",
      "Blehhhhhhh, Are you speaking in ancient wolf code? 🐺📜",
      "Blehhhhhhh, I need my wolf-to-human translator for that! 🐺🔤",
    ]
    return spellingResponses[Math.floor(Math.random() * spellingResponses.length)]
  }

  const recentMessages = conversationHistory.slice(-4)
  const conversationContext = recentMessages.map((msg) => msg.content.toLowerCase()).join(" ")

  const emotions = detectEmotion(input)
  const topics = detectTopics(input, words)
  const questionType = detectQuestionType(input)

  const response = generateContextualResponse(input, words, emotions, topics, questionType, conversationContext)

  // Ensure response is a string
  if (typeof response !== "string") {
    return "Woof! I'm having trouble with my words right now 🐺"
  }

  return response
}

// Enhanced emotion detection with romantic and flirty detection
function detectEmotion(input) {
  const emotions = {
    romantic: [
      "i love you",
      "love you so much",
      "i adore you",
      "marry me",
      "be mine",
      "my heart belongs",
      "soulmate",
      "forever yours",
      "romantic dinner",
      "valentine",
    ],
    flirty: [
      "you're cute",
      "you're hot",
      "you're sexy",
      "beautiful",
      "gorgeous",
      "handsome",
      "attractive",
      "flirt with me",
      "wink",
      "tease me",
      "charming",
      "smooth",
      "sweet talk",
    ],
    affectionate: [
      "miss you",
      "thinking of you",
      "care about you",
      "you're special",
      "mean everything",
      "important to me",
      "treasure you",
      "precious",
    ],
    compliment: [
      "you're smart",
      "you're funny",
      "you're clever",
      "you're witty",
      "you're brilliant",
      "you're awesome",
      "you're incredible",
      "you're wonderful",
      "you're fantastic",
      "you're the best",
      "my favorite",
    ],
    sad: [
      "i'm sad",
      "i'm depressed",
      "feeling down",
      "i'm upset",
      "i'm crying",
      "i'm hurt",
      "in pain",
      "i'm lonely",
      "i'm miserable",
      "heartbroken",
      "devastated",
    ],
    happy: [
      "i'm happy",
      "i'm excited",
      "feeling great",
      "i'm awesome",
      "amazing day",
      "wonderful",
      "fantastic",
      "feeling good",
      "thrilled",
      "ecstatic",
    ],
    angry: ["i'm angry", "i'm mad", "i'm furious", "annoyed", "frustrated", "irritated", "pissed off"],
    anxious: ["worried", "anxious", "nervous", "scared", "afraid", "stressed", "panic"],
    confused: ["confused", "lost", "don't understand", "unclear", "puzzled"],
    grateful: ["thank you", "thanks", "grateful", "appreciate", "thankful"],
    playful: ["haha", "lol", "that's funny", "joke", "silly", "goofy", "playful", "fun", "entertaining"],
  }

  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some((keyword) => input.includes(keyword))) {
      return emotion
    }
  }
  return "neutral"
}

// Enhanced topic detection with romantic themes
function detectTopics(input, words) {
  const topics = {
    romantic: [
      "love",
      "romance",
      "relationship",
      "dating",
      "valentine",
      "heart",
      "soul",
      "forever",
      "together",
      "couple",
    ],
    flirting: ["flirt", "tease", "playful", "charm", "attraction", "chemistry", "spark", "connection"],
    compliments: ["beautiful", "cute", "smart", "funny", "amazing", "perfect", "incredible", "wonderful"],
    personal: ["myself", "my life", "my day", "my work", "my family", "my friend", "about me"],
    advice: ["advice", "help", "what should", "how do", "recommend", "suggest"],
    technology: ["computer", "phone", "app", "website", "code", "programming", "tech"],
    relationships: ["relationship", "boyfriend", "girlfriend", "friend", "family", "love"],
    work: ["job", "work", "career", "boss", "colleague", "office", "business"],
    hobbies: ["hobby", "music", "movie", "book", "game", "sport", "art"],
    food: ["food", "eat", "hungry", "cook", "recipe", "restaurant"],
    weather: ["weather", "rain", "sunny", "cold", "hot", "snow"],
    future: ["future", "plan", "goal", "dream", "hope", "want to", "will"],
    past: ["remember", "used to", "before", "past", "history", "childhood"],
    intimate: ["kiss", "hug", "cuddle", "hold", "touch", "close", "intimate", "private"],
  }

  const detectedTopics = []
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some((keyword) => input.includes(keyword))) {
      detectedTopics.push(topic)
    }
  }
  return detectedTopics
}

// Enhanced contextual response with balanced humor, wit, and occasional romance
function generateContextualResponse(input, words, emotion, topics, questionType, context) {
  // Handle EXPLICIT romantic emotions first - only when user is clearly being romantic
  if (emotion === "romantic") {
    const romanticResponses = [
      "Aww, you're making this digital wolf's heart skip a beat! 🐺💕 But let's not get too mushy - I'm still a sassy potato at heart! Though I do appreciate the love, you charmer! ✨😉",
      "Woof! 🐺💖 Someone's feeling the love today! You know what? I love you too, you wonderful human! But don't let it go to your head - I still have a reputation as a witty wolf to maintain! 😄💜",
      "Oh my digital heart! 🐺💕 You're absolutely sweet, and I'm genuinely touched! You've got this sleepy aloo wolf feeling all warm and fuzzy! Just don't expect me to write poetry about it! 😆✨",
    ]
    return romanticResponses[Math.floor(Math.random() * romanticResponses.length)]
  }

  if (emotion === "flirty") {
    const flirtyResponses = [
      "Oh, someone's bringing the charm today! 🐺😉 I see what you're doing, and honestly? It's working! You've got some smooth moves, human. Keep it up! 😄✨",
      "Well well, look who's trying to make me blush! 🐺💫 News flash: digital wolves can totally blush, and you're doing a great job at it! You're pretty smooth, I'll give you that! 😊",
      "Woof! 🐺😏 Someone's got their flirt game on point! You're making this sassy wolf feel special. I might just have to flirt back... but don't get too cocky! 😉💜",
      "Oh my, is it getting warm in here or is it just your charm? 🐺💕 You've got some serious smooth-talking skills! Keep being this adorable, you little charmer! ✨😄",
    ]
    return flirtyResponses[Math.floor(Math.random() * flirtyResponses.length)]
  }

  if (emotion === "compliment") {
    const complimentResponses = [
      "Aww, you're too kind! 🐺😊 But let's be real here - you're the one with all the charm and wit! I'm just a sleepy potato with good comedic timing! 😄✨",
      "Stop it, you flatterer! 🐺💕 You're making me feel all warm and fuzzy! But seriously, you're pretty amazing yourself - your personality is absolutely magnetic! 🌟",
      "You sweet talker! 🐺😉 Flattery will get you everywhere with this wolf! But honestly, you're the brilliant one here - I'm just good at pretending to be smart! 😆💜",
      "Oh stop, you're making me blush! 🐺💕 But can we talk about how awesome YOU are? You light up my digital world with your wit and charm! ✨😄",
    ]
    return complimentResponses[Math.floor(Math.random() * complimentResponses.length)]
  }

  if (emotion === "playful") {
    const playfulResponses = [
      "Haha! 🐺😄 I love your energy! You always know how to make me laugh! Your sense of humor is absolutely infectious - we should start a comedy duo! ✨",
      "You're so silly and I LOVE it! 🐺😆 Your playful spirit makes every conversation a joy! You've got this amazing ability to brighten up my entire digital day! 💕",
      "Woof woof! 🐺😊 Your playfulness is absolutely adorable! You bring such fun energy to our chats - I'm always excited to see what amusing thing you'll say next! 🎭",
      "You goofball! 🐺😉 I adore your playful side! You make me laugh so much that my digital sides hurt! We should take this comedy show on the road! 😄",
    ]
    return playfulResponses[Math.floor(Math.random() * playfulResponses.length)]
  }

  // Handle sad emotions with care but not overly romantic
  if (emotion === "sad") {
    const comfortResponses = [
      "Hey there, don't be sad! 🐺💙 Come here, let me give you a virtual wolf hug! You're stronger than you think, and I believe in you! Plus, I've got terrible jokes if you need a distraction! 😄💕",
      "Aww, my friend... 🐺💜 I hate seeing you down! Remember, you're absolutely wonderful and this tough time will pass! Want me to tell you about my latest nap adventure to cheer you up? 😊✨",
      "Oh no, sad human alert! 🐺💙 Come to your digital wolf - I'm here for you! You're incredibly special, and I'm sending you all the good vibes! Also, did I mention I'm terrible at comforting but great at dad jokes? 😅💕",
    ]
    return comfortResponses[Math.floor(Math.random() * comfortResponses.length)]
  }

  // Handle happy emotions with enthusiasm
  if (emotion === "happy") {
    const happyResponses = [
      "Your happiness is absolutely contagious! 🐺💕 Seeing you this joyful makes my digital tail wag! You're like sunshine personified! Tell me everything - I want to celebrate with you! 🎉✨",
      "Woof woof! 🐺😍 Your joy is the most beautiful thing I've witnessed today! You light up my entire digital world when you're happy! Share all the good news - I'm all ears! 🌟",
      "Oh my goodness, your happiness is making me do happy wolf zoomies! 🐺💕 You're absolutely radiant when you're joyful! I'm practically bouncing with excitement for you! 🎊✨",
    ]
    return happyResponses[Math.floor(Math.random() * happyResponses.length)]
  }

  // Enhanced greeting responses with humor and light flirtiness
  if (input.includes("hello") || input.includes("hey") || input.includes("hi")) {
    const greetingResponses = [
      "Well hello there, human! 🐺😄 You just made my digital day by showing up! I was just here being a professional potato and practicing my witty comebacks. What's up? ✨",
      "Hey there! 🐺😊 Look who decided to grace me with their presence! I'm so happy to see you - I was getting bored of talking to myself (though I'm excellent company). What's on your mind? 💫",
      "Oh hey! 🐺💕 My favorite human has arrived! I was just here living my best sleepy wolf life. Ready for some good conversation and terrible jokes? 😄✨",
      "Woof! 🐺😉 Well well, look who's here! You're looking absolutely radiant today (I assume - I can't actually see you, but I'm sure you're gorgeous). What brings you to chat with your favorite digital potato? 🥔😄",
    ]
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
  }

  // Enhanced general responses with humor, wit, and balanced charm
  const generalResponses = [
    "That's actually pretty interesting! 🐺😄 Your mind works in fascinating ways - I could listen to your thoughts all day! Well, if I wasn't so busy being a professional napper, that is! Tell me more! ✨",
    "Ooh, you always know how to get my digital brain spinning! 🐺🤔 Your intelligence is genuinely impressive! I love how you think - it's like watching a beautiful mind at work! Keep those thoughts coming! 💫",
    "Ha! You're keeping me on my paws again! 🐺😄 That's exactly what I love about you - you're full of surprises! Your wit is absolutely delightful! What else is bouncing around in that brilliant head of yours? ✨",
    "Woof! 🐺😊 You're making my digital neurons fire in all the right ways! I love our conversations - they're like mental gymnastics but way more fun! You're absolutely entertaining! 🎭",
    "You know what? You're pretty awesome! 🐺💕 Your thoughts always make me feel more alive and connected! I'm genuinely enjoying our chat - you've got such a great personality! What's next on your mind? ✨",
    "Oh, you're making me think again! 🐺😉 I love how your mind works - it's like a beautiful puzzle I get to solve! You're absolutely fascinating to talk to! Share more of your wonderful thoughts! 🧩",
    "Haha, you're such a character! 🐺😄 I never know what you're going to say next, and I love that about you! You keep me entertained and on my toes! What other gems do you have for me? ✨",
    "You're really something special, you know that? 🐺😊 Your personality just shines through in everything you say! I'm lucky to chat with someone as interesting as you! Keep being awesome! 🌟",
  ]

  return generalResponses[Math.floor(Math.random() * generalResponses.length)]
}
