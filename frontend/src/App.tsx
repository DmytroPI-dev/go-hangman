import { Box, VStack, HStack, Stack, Button, Text, Heading, useToast, Spinner } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
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
import HelpModal from "./components/HelpModal";
import SettingsDrawer from "./components/SettingsDrawer";


function App() {
  const { i18n, t } = useTranslation();
  const {
    language,
    difficulty,
    isFirstVisit,
    updateLanguage,
    updateDifficulty,
    markIntroSeen
  } = useSettings();
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
    openLetterAttempts,
    guessedLetters,
    isGameOver,
    won,
    isLoading,
    hint,
    startNewGame,
    makeGuess,
    requestHint,
    openLetter,
    resetGamestate,
    resetHint,
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

  // Change language in i18n when settings are updated
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Auto-start game when settings are configured but no session exists
  useEffect(() => {
    if (!sessionId && hasConfiguredSettings && !isFirstVisit && !isLoading) {
      startNewGame(language, difficulty);
    }
  }, [sessionId, hasConfiguredSettings, isFirstVisit, isLoading, language, difficulty]);

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

  // Show hint in a toast notification when received from the API.
  useEffect(() => {
    if (hint) {
      toast({
        title: t('game.hintReceived'),
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

  // Show game over toast when game ends, with different messages for win/loss and displaying the correct word
  useEffect(() => {
    if (isGameOver) {
      toast({
        title: won ? t('game.youWon') : t('game.gameOver'),
        description: (
          <Box>
            <Text>{t('game.theWordWas')}:</Text>
            <Text fontWeight="bold" mt={1} textAlign="center">
              {currentWord.replace(/_/g, ' ')}
            </Text>
          </Box>
        ), duration: 5000,
        isClosable: true,
        status: won ? "success" : "error",
        position: "top",
        containerStyle: {
          fontSize: "2xl",
          fontWeight: "bold",
        },
      });
    }
  }, [isGameOver, won, currentWord, toast]);

  // Function to handle settings changes from the SettingsDrawer, resets game state and starts a new game with updated settings
  const handleSettingsChange = async (newLang: Language, newDiff: Difficulty) => {
    resetGamestate();
    onSettingsClose();
    await startNewGame(newLang, newDiff);
  }

  // Function to handle game start with selected settings, called from GameSetup component
  const handleGameStart = async (lang: Language, diff: Difficulty) => {
    updateLanguage(lang);
    updateDifficulty(diff);
    markIntroSeen();
    await startNewGame(lang, diff)
    setHasConfiguredSettings(true);
  }


  //  Functions to handle letter clicks, hint requests, letter openLetter, and new game button clicks, calling corresponding functions from useGame hook and showing toast for hints
  const handleLetterClick = async (letter: string) => {
    await makeGuess(letter.toLocaleLowerCase());
  }

  //  Handle hint button click, request a hint from the API and show it in a toast notification
  const handleHintClick = async () => {
    await requestHint();
  }

  //  Handle openLetter letter button click, call the API to openLetter a letter and update the game state accordingly
  const handleOpenLetter = async () => {
    await openLetter();
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
            marginTop={2}
            size="lg"
            position="absolute"
            top={12}
            right={-2}
            colorScheme="teal"
          />
          {/* Hint button for mobile */}
          <Button
            leftIcon={<span>💡</span>}
            onClick={handleHintClick}
            variant="ghost"
            marginTop={2}
            display={{ base: "inline-flex", md: "none" }}
            size="lg"
            position="absolute"
            top={20}
            right={-2}
            colorScheme="whiteAlpha"
          />
          {/* New Game Button for mobile */}
          <Button
            leftIcon={<span>🎮</span>}
            onClick={handleNewGame}
            variant="ghost"
            marginTop={2}
            display={{ base: "inline-flex", md: "none" }}
            size="lg"
            position="absolute"
            top={28}
            right={-2}
            colorScheme="whiteAlpha"
          />
          {/* Open Letter Button for mobile */}
          {difficulty !== "Hard" && (
            <Button
              leftIcon={<span>🔍</span>}
              onClick={handleOpenLetter}
              variant="ghost"
              marginTop={2}
              display={{ base: "inline-flex", md: "none" }}
              size="lg"
              position="absolute"
              top={36}
              right={-2}
              colorScheme="whiteAlpha"
            />
          )}
          {/* Game content */}

          <VStack spacing={{ base: 2, md: 6 }} maxW="800px" mx="auto" px={{ base: 1, md: 0 }}>
            <Heading as="h1" size={{ base: "xl", md: "2xl" }} color="#1a2a6c">{t('game.title')}</Heading>
            {/* Game status */}
            <Stack spacing={{ base: 1, md: 2 }} direction={{ base: "column", md: "row" }} align="flex-start">
              <Text fontSize={{ base: "2xl", md: "2xl" }}>{t('game.attemptsLeft', { count: triesLeft })}</Text>
              {difficulty !== "Hard" && (
                <Text fontSize={{ base: "2xl", md: "2xl" }}>{t('game.openLetterAttempts', { count: openLetterAttempts })}</Text>
              )}
            </Stack>
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
                display={{ base: "none", md: "inline-flex" }}
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
                💡{t('game.getHint')}
              </Button>
              {difficulty !== "Hard" && (
                <Button
                  colorScheme="teal"
                  display={{ base: "none", md: "inline-flex" }}
                  onClick={handleOpenLetter}
                  isDisabled={isGameOver || triesLeft <= 1 || openLetterAttempts <= 0}
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
                  🔍 {t('game.openLetter')}
                </Button>
              )}
              <Button
                colorScheme="green"
                display={{ base: "none", md: "inline-flex" }}
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
                🎮 {t('game.newGame')}
              </Button>
            </HStack>
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


