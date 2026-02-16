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
    return (
        <VStack spacing={{base: 4, md: 6}} maxW="400px" mx="auto" px={{ base: 2, md: 0 }} mt={10}>
            <Heading fontSize={{ base: "xl", md: "2xl", sm: "2xl" }} textAlign="center" >Settings/Налаштування/Ustawienia</Heading>
            <Box w="100%">
                <Text mb={2} fontSize={{base: "xl", md: "2xl", sm: "xl"}}>Language/Мова/Język</Text>
                <Select size="lg" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                    <option value="en">English</option>
                    <option value="ua">Українська</option>
                    <option value="pl">Polski</option>
                </Select>
            </Box>
            <Box w="100%">
                <Text mb={2} fontSize={{base: "xl", md: "2xl", sm: "xl"}}>Difficulty/Складність/Poziom trudności</Text>
                <Select size="lg" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                    <option value="Easy">Easy/Легка/Łatwy</option>
                    <option value="Normal">Normal/Нормальна/Normalny</option>
                    <option value="Hard">Hard/Важка/Trudny</option>
                </Select>
            </Box>
            <Box w="100%" textAlign="center">
                <Button colorScheme="blue" onClick={handleStartGame} size={{ base: "lg", md: "xl" }} fontSize={{ base: "xl", md: "2xl" }}>
                    👍
                </Button>
            </Box >
        </VStack>
    )
}

export default GameSetup


