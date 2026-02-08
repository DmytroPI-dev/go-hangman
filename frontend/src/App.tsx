import type { Language, Difficulty } from "./types/game";
import { Box, VStack, HStack, Button, Text, Heading, useToast, Spinner } from "@chakra-ui/react";
import { useGame } from "./hooks/useGame";
import { useSettings } from "./hooks/useSettings";
import { useEffect } from "react";
import GameSetup from "./components/GameSetup";
import WordDisplay from "./components/WordDisplay";
import Keyboard from "./components/Keyboard";
import HangmanDraw from "./components/HangmanDraw";
import Intro from "./components/Intro";

function App() {
  const { isFirstVisit, markIntroSeen, language, difficulty } = useSettings();
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

   const handleGameStart = async () => {
    await startNewGame(language, difficulty);
  }

  const handleLetterClick = async (letter: string) => {
    await makeGuess(letter.toLocaleLowerCase());
  }

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

  const handleRevealLetter = async () => {
    await revealLetter();
  }

  const handleNewGame = () => {
    resetGamestate();
  }

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



  if (isFirstVisit) {
    return <Intro onComplete={markIntroSeen} />;
  }

  if (!sessionId) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
        <GameSetup onGameStart={handleGameStart} />
      </Box>
    )
  }

  if (isLoading && !currentWord) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100" p={4}>
      <VStack spacing={6} maxW="800px" mx="auto">
        <Heading as="h1" size="2xl">Hangman Game</Heading>
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
  );
}

export default App;


