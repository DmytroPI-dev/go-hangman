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
                    w={{ base: "24px", sm: "24px", md: "40px" }}  // Smaller on mobile
                    h={{ base: "32px", sm: "32px", md: "50px" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderBottom="1px solid"
                    borderColor="gray.700"
                    fontWeight="bold"
                >
                    <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }}>
                        {char}
                    </Text>
                </Box>
            ))}
        </HStack>
    )
}

export default WordDisplay;