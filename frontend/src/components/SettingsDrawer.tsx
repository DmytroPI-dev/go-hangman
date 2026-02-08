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
    Stack
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
                            <FormLabel>Language/Język/Мова</FormLabel>
                            <RadioGroup value={tempLanguage} onChange={(val) => setTempLanguage(val as Language)}>
                                <Stack direction="column">
                                    <Radio value="en">🇬🇧 English</Radio>
                                    <Radio value="ua">🇺🇦 Українська</Radio>
                                    <Radio value="pl">🇵🇱 Polski</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {/* Difficulty Selection */}
                        <FormControl>
                            <FormLabel>Difficulty/Trudność/Складність</FormLabel>
                            <RadioGroup value={tempDifficulty} onChange={(val) => setTempDifficulty(val as Difficulty)}>
                                <Stack direction="column">
                                    <Radio value="Easy">Easy/Łatwy/Легкий</Radio>
                                    <Radio value="Normal">Normal/Normalny/Нормальний</Radio>
                                    <Radio value="Hard">Hard/Trudny/Важкий</Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </VStack>
                </DrawerBody>

                <DrawerFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSave}>
                        Save & New Game
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default SettingsDrawer