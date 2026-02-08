import axios from "axios";

import type {
    NewGameRequest,
    NewGameResponse,
    GuessRequest,
    GuessResponse,
    GameState,
} from "../types/game";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Service functions for interacting with the Hangman game API
export const createNewGame = async (request: NewGameRequest): Promise<NewGameResponse> => {
    const response = await axios.post<NewGameResponse>(`${API_BASE_URL}/api/game/new`, request);
    return response.data;
};

export const makeGuess = async (sessionId: string, request: GuessRequest): Promise<GuessResponse> => {
    const response = await axios.post<GuessResponse>(`${API_BASE_URL}/api/game/${sessionId}/guess`, request);
    return response.data;
};

export const getGameState = async (sessionId: string): Promise<GameState> => {
    const response = await axios.get<GameState>(`${API_BASE_URL}/api/game/${sessionId}/state`);
    return response.data;
};

export const getHint = async (sessionId: string): Promise<string> => {
    const response = await axios.get<{ hint: string }>(`${API_BASE_URL}/api/game/${sessionId}/hint`);
    return response.data.hint;
}

export const revealLetter = async (sessionId: string): Promise<GuessResponse> => {
    const response = await axios.post<GuessResponse>(`${API_BASE_URL}/api/game/${sessionId}/reveal`);
    return response.data;
}

