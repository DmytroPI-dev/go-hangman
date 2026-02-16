import { useState } from "react";
import type { Language, Difficulty } from "../types/game";
import { createNewGame, makeGuess as apiMakeGuess, getHint, openLetter as apiOpenLetter } from "../services/gameApi";

// Custom hook to manage game state and interactions with the Hangman game API
export const useGame = () => {

    // State variables to manage game session, settings, and status
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>("en");
    const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
    const [currentWord, setCurrentWord] = useState<string>("");
    const [triesLeft, setTriesLeft] = useState<number>(0);
    const [openLetterAttempts, setOpenLetterAttempts] = useState<number>(0);
    const [letter, setLetter] = useState<string>("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);
    const [won, setWon] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hint, setHint] = useState<string | null>(null);

    // Function to start a new game by calling the API and initializing state
    const startNewGame = async (lang: Language, diff: Difficulty) => {
        setIsLoading(true);
        try {
            const response = await createNewGame({ language: lang, difficulty: diff });
            setSessionId(response.session_id);
            setLanguage(lang);
            setDifficulty(diff);
            setCurrentWord("_ ".repeat(response.word_length).trim());
            setTriesLeft(response.max_attempts);
            setGuessedLetters([]);
            setIsGameOver(false);
            setWon(false);
            setHint(null);
            setOpenLetterAttempts(response.open_letter_attempts);
            setIsLoading(false);
        } catch (error) {
            console.error("Error starting new game:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Function to make a guess by calling the API and updating state based on the response
    const makeGuess = async (letter: string) => {
        if (!sessionId || isGameOver) return;
        setIsLoading(true);
        try {
            const response = await apiMakeGuess(sessionId, { letter });
            setCurrentWord(response.current_word);
            setTriesLeft(response.tries_left);
            setGuessedLetters((prev) => [...prev, letter]);
            setIsGameOver(response.is_game_over);
            setWon(response.won);
        } catch (error) {
            console.error("Error making guess:", error);
        } finally {
            setIsLoading(false);
        }
    }

    //  Function to request a hint from the API and update state with the received hint
    const requestHint = async () => {
        if (!sessionId || isGameOver) return;
        setIsLoading(true);
        try {
            const hint = await getHint(sessionId);
            setHint(hint);
        } catch (error) {
            console.error("Error getting hint:", error);
        } finally {
            setIsLoading(false) // Reset hint after showing it to the user
        }
    }

    //  Function to openLetter a letter by calling the API and treating it as a guess to update game state accordingly
    const openLetter = async () => {
        if (!sessionId || isGameOver) return;
        setIsLoading(true);
        try {
            const response = await apiOpenLetter(sessionId);
            setCurrentWord(response.current_word);
            setTriesLeft(response.tries_left);
            setOpenLetterAttempts((prev) => prev - 1);
            setGuessedLetters((prev) => [...prev, letter]);
            setIsGameOver(response.is_game_over);
            setWon(response.won);
            if (response.opened_letter) {
                setGuessedLetters((prev) => [...prev, response.opened_letter!]);
            }
        } catch (error) {
            console.error("Error openLettering letter:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Function to reset the game state to initial values, useful for starting a new game or resetting after game over
    const resetGamestate = () => {
        setSessionId(null);
        setLanguage("en");
        setDifficulty("Easy");
        setCurrentWord("");
        setTriesLeft(0);
        setOpenLetterAttempts(0);
        setLetter("");
        setGuessedLetters([]);
        setIsGameOver(false);
        setWon(false);
        setHint(null);
    }
    // Function to reset the hint state, allowing to call the hint again
    const resetHint = () => {
        setHint(null);
    }

    // Return all state variables and functions for use in components
    return {
        // Game session state and settings
        sessionId,
        language,
        difficulty,
        currentWord,
        triesLeft,
        openLetterAttempts,
        letter,
        guessedLetters,
        isGameOver,
        won,
        isLoading,
        hint,
        // Functions to interact with the game API and manage game state
        startNewGame,
        makeGuess,
        requestHint,
        openLetter,
        resetGamestate,
        resetHint,
    }
}