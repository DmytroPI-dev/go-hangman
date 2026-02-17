// Type definitions for the Hangman game, including request and response structures for API calls, and types for game state, language, and difficulty settings.
export type NewGameRequest = {
    language: Language
    difficulty: Difficulty
}

export type NewGameResponse = {
    session_id: string
    word_length: number
    max_attempts: number
    open_letter_attempts: number
}

export type GuessRequest = {
    letter: string
}

export type GuessResponse = {
    correct: boolean
    current_word: string
    tries_left: number
    is_game_over: boolean
    won: boolean
    opened_letter?: string
}

export type GameState = {
    current_word: string
    tries_left: number
    is_game_over: boolean
    won: boolean
    open_letter_attempts: number
    opened_letter?: string
}

export type Language = "en" | "uk" | "pl"

export type Difficulty = "Easy" | "Normal" | "Hard"
