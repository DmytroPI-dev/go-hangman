import { HStack, Box, Text } from "@chakra-ui/react";

// WordDisplay component to show the current state of the word being guessed
interface WordDisplayProps {
    currentWord: string;
}

// Component to display the current state of the word being guessed
function WordDisplay({ currentWord }: WordDisplayProps) {
    return (
        <HStack spacing={2} justify="center">
            {currentWord.split(" ").map((char, index) => (
                <Box
                    key={index}
                    w="50px"
                    h="50px"
                    borderWidth={2}
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.50"
                >
                    <Text fontSize="2xl" fontWeight="bold" fontFamily="monospace">
                        {char}
                    </Text>
                </Box>
            ))}
        </HStack>
    )
}

export default WordDisplay;