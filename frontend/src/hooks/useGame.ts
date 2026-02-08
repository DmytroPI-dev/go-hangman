import { useState } from "react";
import type { Language, Difficulty } from "../types/game";
import { createNewGame, makeGuess as apiMakeGuess, getHint, revealLetter as apiRevealLetter } from "../services/gameApi";

// Custom hook to manage game state and interactions with the Hangman game API
export const useGame = () => {

    // State variables to manage game session, settings, and status
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>("en");
    const [difficulty, setDifficulty] = useState<Difficulty>("Easy");
    const [currentWord, setCurrentWord] = useState<string>("");
    const [triesLeft, setTriesLeft] = useState<number>(0);
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
            setIsLoading(false);
        }
    }

    //  Function to reveal a letter by calling the API and treating it as a guess to update game state accordingly
    const revealLetter = async () => {
        if (!sessionId || isGameOver) return;
        setIsLoading(true);
        try {
            const response = await apiRevealLetter(sessionId);
            setCurrentWord(response.current_word);
            setTriesLeft(response.tries_left);
            setIsGameOver(response.is_game_over);
            setWon(response.won);
        } catch (error) {
            console.error("Error revealing letter:", error);
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
        setGuessedLetters([]);
        setIsGameOver(false);
        setWon(false);
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
        guessedLetters,
        isGameOver,
        won,
        isLoading,
        hint,
        // Functions to interact with the game API and manage game state
        startNewGame,
        makeGuess,
        requestHint,
        revealLetter,
        resetGamestate,
    }
}