import { Box, VStack, HStack, Button, Text, Heading, useToast, Spinner } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { workbookPageStyles, redMarginStyles } from "./theme/workBookTheme";
import { useGame } from "./hooks/useGame";
import { useSettings } from "./hooks/useSettings";
import { useState, useEffect } from "react";
import type { Difficulty, Language } from "./types/game";
import GameSetup from "./components/GameSetup";
import WordDisplay from "./components/WordDisplay";
import Keyboard from "./components/Keyboard";
import HangmanDraw from "./components/HangmanDraw";
import Intro from "./components/Intro";
import SettingsDrawer from "./components/SettingsDrawer";

function App() {
  const { isFirstVisit, markIntroSeen, language, difficulty, updateLanguage, updateDifficulty } = useSettings();
  const [hasConfiguredSettings, setHasConfiguredSettings] = useState(() => {
    return language !== 'en' || difficulty !== 'Easy' || !isFirstVisit;
  });
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  const toast = useToast();
  const {
    sessionId,
    currentWord,
    triesLeft,
    guessedLetters,
    isGameOver,
    won,
    isLoading,
    hint,
    startNewGame,
    makeGuess,
    requestHint,
    revealLetter,
    resetGamestate,
  } = useGame();

  const maxTries = (() => {
    switch (difficulty) {
      case "Hard":
        return 3;
      case "Normal":
        return 5;
      default:
        return 7;
    }
  })();


  // Auto-start game when settings are configured but no session exists
  useEffect(() => {
    if (!sessionId && hasConfiguredSettings && !isFirstVisit && !isLoading) {
      startNewGame(language, difficulty);
    }
  }, [sessionId, hasConfiguredSettings, isFirstVisit]);

  // Keyboard event listener for letter guesses
  useEffect(() => {
    if (!isGameOver && sessionId) {
      const handleKeyPress = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        // Check if already guessed
        if (guessedLetters.includes(key)) return;

        // Language-specific validation
        if (language === "en" && /^[a-z]$/.test(key)) {
          makeGuess(key);
        } else if (language === "ua" && /^[\u0400-\u04FF]$/.test(key)) {
          makeGuess(key);
        } else if (language === "pl" && /^[a-ząćęłńóśźż]$/.test(key)) {
          makeGuess(key);
        }
      }
      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [isGameOver, sessionId, guessedLetters, language, makeGuess]);

  // Function to handle game start with selected settings, called from GameSetup component
  const handleGameStart = async (lang: Language, diff: Difficulty) => {
    await startNewGame(lang, diff)
    setHasConfiguredSettings(true);
  }

  // Function to handle settings changes from the SettingsDrawer, resets game state and starts a new game with updated settings
  const handleSettingsChange = async (newLang: Language, newDiff: Difficulty) => {
    resetGamestate();
    onSettingsClose();
    await startNewGame(newLang, newDiff);
  }

  //  Functions to handle letter clicks, hint requests, letter reveal, and new game button clicks, calling corresponding functions from useGame hook and showing toast for hints
  const handleLetterClick = async (letter: string) => {
    await makeGuess(letter.toLocaleLowerCase());
  }

  //  Handle hint button click, request a hint from the API and show it in a toast notification
  const handleHintClick = async () => {
    await requestHint();
    if (hint) {
      toast({
        title: "Hint",
        description: hint,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }

  //  Handle reveal letter button click, call the API to reveal a letter and update the game state accordingly
  const handleRevealLetter = async () => {
    await revealLetter();
  }

  //  Handle new game button click, reset the game state and start a new game with the current settings
  const handleNewGame = () => {
    resetGamestate();
  }

  // Show intro screen for the first time
  if (isFirstVisit) {
    return <Intro onComplete={markIntroSeen} />;
  }

  // Show game setup screen if no active session and settings are not configured
  if (!sessionId && !hasConfiguredSettings) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
        <Box {...workbookPageStyles}>
          <Box {...redMarginStyles} />
          <GameSetup onGameStart={handleGameStart} />
        </Box>
      </Box>
    )
  }


  // Show loading spinner while fetching game data for the first time
  if (isLoading && !currentWord && hasConfiguredSettings && !sessionId) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
        <Spinner size="xl" />
      </Box>
    )
  }

  // Main game interface with hangman drawing, word display, keyboard, and action buttons
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100" p={4}>
      <Box {...workbookPageStyles}>
        <Box {...redMarginStyles} />
        {/* Settings Drawer */}
        <Button
          leftIcon={<span>⚙️</span>}
          onClick={onSettingsOpen}
          variant="ghost"
          size="sm"
          position="absolute"
          top={4}
          right={4}
          colorScheme="blue"
        >

        </Button>
        <VStack spacing={6} maxW="800px" mx="auto">
          <Heading as="h1" size="2xl" color="#1a2a6c">Hangman Game</Heading>

          {/* Game status */}
          <HStack spacing={4}>
            <Text fontSize="lg">Attempts left: {triesLeft}</Text>
          </HStack>
          {/* Hangman drawing */}
          <HangmanDraw incorrectGuesses={maxTries - triesLeft} difficulty={difficulty} />
          {/* Word display */}
          <WordDisplay currentWord={currentWord} />
          {/* Keyboard */}
          <Keyboard language={language} guessedLetters={guessedLetters} onLetterClick={handleLetterClick} disabled={isGameOver} />
          {/* Action buttons */}
          <HStack spacing={4}>
            <Button colorScheme="blue" onClick={handleHintClick} isDisabled={isGameOver}>Get Hint</Button>
            <Button colorScheme="teal" onClick={handleRevealLetter} isDisabled={isGameOver || triesLeft <= 1}>Reveal Letter</Button>
            <Button colorScheme="green" onClick={handleNewGame}>New Game</Button>
          </HStack>
          {/* Game over message */}
          {isGameOver && (
            <Box
              p={4}
              bg={won ? "green.100" : "red.100"}
              borderRadius="md"
              borderWidth={2}
              borderColor={won ? 'green.500' : 'red.500'}
            >
              <Heading size="lg" color={won ? "green.500" : "red.500"}
              >{won ? '🎉 You Won!' : '😢 Game Over'}</Heading>
              <Text mt={2}>The word was: <strong>{currentWord.replace(/_/g, ' ')}</strong></Text>
            </Box>
          )}
        </VStack>
      </Box>
      {/* // Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        currentLanguage={language}
        currentDifficulty={difficulty}
        onLanguageChange={updateLanguage}
        onDifficultyChange={updateDifficulty}
        onSaveAndNewGame={handleSettingsChange}  // This will receive (lang, diff)
      />
    </Box>
  );
}

export default App;


