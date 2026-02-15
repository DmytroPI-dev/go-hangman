import { useState, useEffect } from "react";
import type { Language, Difficulty } from "../types/game";


const SETTINGS_KEY = "hangman_settings";

interface Settings {
    language: Language;
    difficulty: Difficulty;
    hasSeenIntro: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    language: "en",
    difficulty: "Easy",
    hasSeenIntro: false,
}

// Custom hook to manage user settings and persist them in localStorage
export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                if (parsed.language && parsed.difficulty && typeof parsed.hasSeenIntro === "boolean") {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Error parsing settings from localStorage:", error);
        }
        return DEFAULT_SETTINGS;
    });

    // Update localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);


    const updateLanguage = (language: Language) => {
        setSettings(prev => ({ ...prev, language }));
    }

    const updateDifficulty = (difficulty: Difficulty) => {
        setSettings(prev => ({ ...prev, difficulty }));
    }

    const markIntroSeen = () => {
        setSettings(prev => ({ ...prev, hasSeenIntro: true }));
    }

    return {
        language: settings.language,
        difficulty: settings.difficulty,
        isFirstVisit: !settings.hasSeenIntro,
        updateLanguage,
        updateDifficulty,
        markIntroSeen,
    }
}