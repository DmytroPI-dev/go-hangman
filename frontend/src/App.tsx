import { Box, VStack, HStack, Button, Text, Heading, useToast, Spinner } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { workbookPageStyles, redMarginStyles } from "./theme/workBookTheme";
import { useGame } from "./hooks/useGame";
import { useSettings } from "./hooks/useSettings";
import { useState, useEffect, } from "react";
import type { Difficulty, Language } from "./types/game";
import GameSetup from "./components/GameSetup";
import WordDisplay from "./components/WordDisplay";
import Keyboard from "./components/Keyboard";
import HangmanDraw from "./components/HangmanDraw";
import Intro from "./components/Intro";
import HelpModal from "./components/HelpModal";
import SettingsDrawer from "./components/SettingsDrawer";

function App() {
  const { isFirstVisit, markIntroSeen, language, difficulty, updateLanguage, updateDifficulty } = useSettings();
  const [hasConfiguredSettings, setHasConfiguredSettings] = useState(() => {
    return language !== 'en' || difficulty !== 'Easy' || !isFirstVisit;
  });
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isHelpOpen, onOpen: onHelpOpen, onClose: onHelpClose } = useDisclosure();

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
    resetHint,
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
  }, [sessionId, hasConfiguredSettings, isFirstVisit, isLoading]);

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
        } else if (language === "ua" && (/^[\u0400-\u04FF]$/.test(key) || key === "'")) {
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

  useEffect(() => {
    if (hint) {
      toast({
        title: "Hint",
        description: hint,
        duration: 3000,
        isClosable: true,
        position: "bottom",
        containerStyle: {
          fontSize: "2xl",
          fontWeight: "bold",
        },
      });
      resetHint();
    };
  }, [hint, toast, resetHint]);

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
    <>
      {/* SVG Filter for hand-drawn effect */}
      < svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="wavy-btn">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg >
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100" p={{ base: 0, md: 4 }}>
        <Box {...workbookPageStyles}>
          <Box {...redMarginStyles} />
          {/* Settings Button */}
          <Button
            leftIcon={<span>⚙️</span>}
            onClick={onSettingsOpen}
            variant="ghost"
            size="lg"
            position="absolute"
            top={4}
            right={-2}
            colorScheme="blue"
          />

          {/* Help Button */}
          <Button
            leftIcon={<span>❓</span>}
            onClick={onHelpOpen}
            variant="ghost"
            size="lg"
            position="absolute"
            top={12}
            right={-2}
            colorScheme="teal"
          />
          <VStack spacing={{ base: 4, md: 6 }} maxW="800px" mx="auto" px={{ base: 2, md: 0 }}>
            <Heading as="h1" size={{ base: "xl", md: "2xl" }} color="#1a2a6c">Hangman Game</Heading>
            {/* Game status */}
            <HStack spacing={4}>
              <Text fontSize={{ base: "2xl", md: "2xl" }}>Tries left: {triesLeft}</Text>
            </HStack>
            {/* Hangman drawing */}
            <HangmanDraw incorrectGuesses={maxTries - triesLeft} difficulty={difficulty} />
            {/* Word display */}
            <WordDisplay currentWord={currentWord} />
            {/* Keyboard */}
            <Keyboard language={language} guessedLetters={guessedLetters} onLetterClick={handleLetterClick} disabled={isGameOver} />
            {/* Action buttons */}
            <HStack spacing={4} flexWrap="wrap" justifyContent="center">
              <Button
                colorScheme="blue"
                onClick={handleHintClick}
                isDisabled={isGameOver}
                size={{ base: "lg", md: "xl" }}
                border="2px solid"
                borderColor="blue.600"
                bg="white"
                color="blue.600"
                fontWeight="bold"
                fontSize={{ base: "lg", md: "xl" }}
                transform={`rotate(${Math.random() * 2 - 1}deg)`}
                boxShadow="2px 2px 0px rgba(0,0,0,0.1)"
                sx={{ filter: 'url(#wavy-btn)' }}
                _hover={{
                  bg: "blue.50",
                  transform: "translateY(-1px)",
                }}
              >
                💡Get Hint
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleRevealLetter}
                isDisabled={isGameOver || triesLeft <= 1}
                size={{ base: "lg", md: "xl" }}
                border="2px solid"
                borderColor="teal.600"
                bg="white"
                color="teal.600"
                fontWeight="bold"
                fontSize={{ base: "lg", md: "xl" }}
                transform={`rotate(${Math.random() * 2 - 1}deg)`}
                boxShadow="2px 2px 0px rgba(0,0,0,0.1)"
                sx={{ filter: 'url(#wavy-btn)' }}
                _hover={{
                  bg: "teal.50",
                  transform: "translateY(-1px)",
                }}
              >
                🔍 Reveal Letter
              </Button>
              <Button
                colorScheme="green"
                onClick={handleNewGame}
                size={{ base: "lg", md: "xl" }}
                border="2px solid"
                borderColor="green.600"
                bg="white"
                color="green.600"
                fontWeight="bold"
                fontSize={{ base: "lg", md: "xl" }}
                transform={`rotate(${Math.random() * 2 - 1}deg)`}
                boxShadow="2px 2px 0px rgba(0,0,0,0.1)"
                sx={{ filter: 'url(#wavy-btn)' }}
                _hover={{
                  bg: "green.50",
                  transform: "translateY(-1px)",
                }}
              >
                🎮 New Game
              </Button>
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
                <Heading size={{ base: "2xl", md: "2xl" }} color={won ? "green.500" : "red.500"}
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
          onSaveAndNewGame={handleSettingsChange}
        />
        <HelpModal
          isOpen={isHelpOpen}
          onClose={onHelpClose}
        />
      </Box>
    </>
  );
}

export default App;


