import { VStack, HStack, Button, useBreakpointValue, Box } from "@chakra-ui/react";
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
    ua: ['ЙЦУКЕНГШЩЗХЇҐ', 'ФІВАПРОЛДЖЄ', "ЯЧСМИТЬБЮ'"],
    pl: ['QWERTYUIOPŻŹ', 'ASDFGHJKLŁĄ', 'ZXCVBNMŚĆĘŃ']
}

// mobile-friendly keyboard component 
const mAlphabets = {
    en: ['QWERT', 'YUIOP', 'ASDFG', 'HJKLZ', 'XCVBNM'],
    ua: ['ЙЦУКЕН', 'ГШЩЗХЇ', 'ҐФІВАП', 'РОЛДЖ', 'ЯЧСМИТ',"ЇЄЬБЮ'" ],
    pl: ['QWERTY', 'UIOPŻŹ', 'ASDFGH', 'JKLŁĄZ', 'XCVBN','MŚĆĘŃ']
}

// Component to display the alphabet buttons for guessing
function Keyboard({ language, guessedLetters, onLetterClick, disabled = false }: KeyboardProps) {
    const isMobile = useBreakpointValue({ base: true, md: false })

    const alphabet = isMobile ? mAlphabets[language] : alphabets[language]
    const isGuessed = (letter: string) => guessedLetters.includes(letter) || guessedLetters.includes(letter.toLocaleLowerCase());

    return (
        <>
            {/* SVG Filter for hand-drawn effect */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <filter id="wavy">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.02"
                            numOctaves="1"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="10"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            <VStack spacing={4}>
                {alphabet.map((row, rowIndex) => (
                    <HStack key={rowIndex} spacing={2} justify="center">
                        {row.split("").map((letter) => {
                            const guessed = isGuessed(letter);

                            return (
                                <Box key={letter} position="relative">
                                    <Button
                                        onClick={() => onLetterClick(letter)}
                                        isDisabled={disabled || guessed}
                                        bg={guessed ? "#e8f5e9" : "white"}
                                        color={guessed ? "#4caf50" : "#1a2a6c"}
                                        border="2px solid"
                                        borderColor={guessed ? "#4caf50" : "#1a2a6c"}
                                        borderRadius="12px"
                                        size={{ base: "md", sm: "lg", md: "lg" }}
                                        minW={{ base: "36px", sm: "36px", md: "48px" }}
                                        h={{ base: "36px", sm: "32px", md: "40px" }}
                                        fontSize={{ base: "md", sm: "lg", md: "md" }}
                                        fontWeight="bold"
                                        p={{ base: 1.5, sm: 1, md: 2 }}
                                        _hover={{
                                            bg: guessed ? "#e8f5e9" : "#f0f0f0",
                                            transform: "translateY(-1px)",
                                        }}
                                        _active={{
                                            transform: "translateY(0)",
                                        }}
                                        cursor={disabled || guessed ? "not-allowed" : "pointer"}
                                        transform={`rotate(${Math.random() * 2 - 1}deg)`}
                                        boxShadow="2px 2px 0px rgba(0,0,0,0.1)"
                                        // Apply hand-drawn filter to borders
                                        sx={{
                                            filter: 'url(#wavy)',
                                        }}
                                    >
                                        {letter}
                                    </Button>

                                    {/* X-cross for guessed letters */}
                                    {guessed && (
                                        <Box
                                            position="absolute"
                                            top="0"
                                            left="0"
                                            right="0"
                                            bottom="0"
                                            pointerEvents="none"
                                        >
                                            {/* First diagonal line */}
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="10%"
                                                right="10%"
                                                h="2px"
                                                bg="#d32f2f"
                                                transform="rotate(45deg)"
                                                transformOrigin="center"
                                                sx={{ filter: 'url(#wavy)' }}  // Wavy X too
                                            />
                                            {/* Second diagonal line */}
                                            <Box
                                                position="absolute"
                                                top="50%"
                                                left="10%"
                                                right="10%"
                                                h="2px"
                                                bg="#d32f2f"
                                                transform="rotate(-45deg)"
                                                transformOrigin="center"
                                                sx={{ filter: 'url(#wavy)' }}  // Wavy X too
                                            />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </HStack>
                ))}
            </VStack>
        </>
    )
}

export default Keyboard;