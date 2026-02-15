import { Box, VStack, Heading, Button, Select, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { Language, Difficulty } from '../types/game'


// GameSetup component allows the user to select language and difficulty before starting a new game
interface GameSetupProps {
    onGameStart: (language: Language, difficulty: Difficulty) => void
}

// Component for setting up a new game with language and difficulty options
function GameSetup({ onGameStart }: GameSetupProps) {
    const [language, setLanguage] = useState<Language>('en')
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy')

    const handleStartGame = () => {
        onGameStart(language, difficulty)
    }

    // Render the game setup form with language and difficulty selection
    return (

        <VStack spacing={4}>
            <Heading>Hangman Game Setup</Heading>
            <Box w="100%">
                <Text mb={2}>Select Language:</Text>
                <Select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                    <option value="en">English</option>
                    <option value="ua">Ukrainian</option>
                    <option value="pl">Polish</option>
                </Select>
            </Box>
            <Box w="100%">
                <Text mb={2}>Select Difficulty:</Text>
                <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                    <option value="Easy">Easy</option>
                    <option value="Normal">Normal</option>
                    <option value="Hard">Hard</option>
                </Select>
            </Box>
            <Box w="100%" textAlign="center">
                <Button colorScheme="blue" onClick={handleStartGame}>
                    Start Game
                </Button>
            </Box >
        </VStack>
    )
}

export default GameSetup


