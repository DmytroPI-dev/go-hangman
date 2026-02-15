import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Button,
    VStack,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Stack,
    Text
} from '@chakra-ui/react'
import { useState } from 'react'
import type { Language, Difficulty } from '../types/game'

interface SettingsDrawerProps {
    isOpen: boolean
    onClose: () => void
    currentLanguage: Language
    currentDifficulty: Difficulty
    onLanguageChange: (lang: Language) => void
    onDifficultyChange: (diff: Difficulty) => void
    onSaveAndNewGame: (language: Language, difficulty: Difficulty) => void
}

function SettingsDrawer({
    isOpen,
    onClose,
    currentLanguage,
    currentDifficulty,
    onLanguageChange,
    onDifficultyChange,
    onSaveAndNewGame
}: SettingsDrawerProps) {
    const [tempLanguage, setTempLanguage] = useState(currentLanguage)
    const [tempDifficulty, setTempDifficulty] = useState(currentDifficulty)

    const handleSave = () => {
        onLanguageChange(tempLanguage)
        onDifficultyChange(tempDifficulty)
        onSaveAndNewGame(tempLanguage, tempDifficulty)
        onClose()
    }

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Game Settings</DrawerHeader>

                <DrawerBody>
                    <VStack spacing={6} align="stretch">
                        {/* Language Selection */}
                        <FormControl>
                            <FormLabel fontSize={{ base: "xl", md: "xl" }}>Language/Język/Мова</FormLabel>
                            <RadioGroup value={tempLanguage} onChange={(val) => setTempLanguage(val as Language)} fontSize={{base :"xl", md: "xl"}}>
                                <Stack direction="column">
                                    <Radio value="en" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}} >🇬🇧 English</Text></Radio>
                                    <Radio value="ua" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}}>🇺🇦 Українська</Text></Radio>
                                    <Radio value="pl" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}}>🇵🇱 Polski</Text></Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {/* Difficulty Selection */}
                        <FormControl>
                            <FormLabel fontSize={{ base: "xl", md: "xl" }}>Difficulty/Trudność/Складність</FormLabel>
                            <RadioGroup value={tempDifficulty} onChange={(val) => setTempDifficulty(val as Difficulty)} fontSize={{base :"xl", md: "xl"}}>
                                <Stack direction="column">
                                    <Radio value="Easy" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}}>Easy/Łatwy/Легкий</Text></Radio>
                                    <Radio value="Normal" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}}>Normal/Normalny/Нормальний</Text></Radio>
                                    <Radio value="Hard" size={{ base: "lg", md: "lg" }}><Text fontSize={{base: "xl", md: "xl"}}>Hard/Trudny/Важкий</Text></Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </VStack>
                </DrawerBody>

                <DrawerFooter>
                    <Button variant="outline" mr={3} onClick={onClose} size={{ base: "md", md: "lg" }} fontSize={{ base: "xl", md: "xl" }}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave} size={{ base: "md", md: "lg" }} fontSize={{ base: "xl", md: "xl" }}>
                        Save & New Game
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default SettingsDrawer