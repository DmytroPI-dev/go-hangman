import { VStack, HStack, Button } from "@chakra-ui/react";
import type { Language } from "../types/game";

// Keyboard component to display the alphabet buttons for guessing
interface KeyboardProps {
    language: Language
    // Array of guessed letters to disable buttons for already guessed letters
    guessedLetters: string[]
    // Callback function to handle when a letter is clicked
    onLetterClick: (letter: string) => void
    // Optional prop to disable the keyboard when the game is over, so using '?' to indicate that it's optional
    disabled?: boolean
}

// Alphabet letters matching actual keyboard layouts
const alphabets = {
    en: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'],
    ua: ['ЙЦУКЕНГШЩЗХЇҐ', 'ФІВАПРОЛДЖЄ', 'ЯЧСМИТЬБЮ'],
    pl: ['QWERTYUIOPŻŹ', 'ASDFGHJKLŁĄ', 'ZXCVBNMŚĆĘŃ']
}

// Component to display the alphabet buttons for guessing
function Keyboard({ language, guessedLetters, onLetterClick, disabled = false }: KeyboardProps) {
    const alphabet = alphabets[language]
    const isGuessed = (letter: string) => guessedLetters.includes(letter) || guessedLetters.includes(letter.toLocaleLowerCase());

    return (
        <VStack spacing={4}>
            {alphabet.map((row, rowIndex) => (
                <HStack key={rowIndex} spacing={2} justify="center">
                    {row.split("").map((letter) => (
                        <Button
                            key={letter}
                            onClick={() => onLetterClick(letter)}
                            isDisabled={disabled || isGuessed(letter)}
                            colorScheme={isGuessed(letter) ? "green" : "blue"}
                        >
                            {letter}
                        </Button>
                    ))}
                </HStack>
            ))}
        </VStack>
    )
}

export default Keyboard;

