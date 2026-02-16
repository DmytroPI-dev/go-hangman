import { useState, useEffect } from "react";
import type { Language, Difficulty } from "../types/game";

const INTRO_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SETTINGS_KEY = "hangman_settings";

interface Settings {
    language: Language;
    difficulty: Difficulty;
    hasSeenIntro: boolean;
    introSeenAt?: number;
}

const DEFAULT_SETTINGS: Settings = {
    language: "en",
    difficulty: "Easy",
    hasSeenIntro: false,
    introSeenAt: undefined,
}

// Custom hook to manage user settings and persist them in localStorage
export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Check if intro TTL has expired
                if (parsed.introSeenAt && Date.now() - parsed.introSeenAt > INTRO_TTL_MS) {
                    parsed.hasSeenIntro = false;
                    parsed.introSeenAt = undefined;
                }
                // Validate the parsed settings structure
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
        setSettings(prev => ({ ...prev, hasSeenIntro: true, introSeenAt: Date.now() }));
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