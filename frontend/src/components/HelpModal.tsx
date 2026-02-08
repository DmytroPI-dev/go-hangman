import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Heading,
    Text,
    Box,
    UnorderedList,
    ListItem
} from '@chakra-ui/react'

interface HelpModalProps {
    isOpen: boolean
    onClose: () => void
}

function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>How to Play</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Game Rules */}
                        <Box>
                            <Heading size="sm" mb={2}>🎯 How to Play</Heading>
                            <Text fontSize="sm">
                                Guess the hidden word one letter at a time. Each wrong guess costs one attempt.
                                Win by revealing the full word before running out of attempts!
                            </Text>
                        </Box>

                        {/* Difficulty Levels */}
                        <Box>
                            <Heading size="sm" mb={2}>⚙️ Difficulty Levels</Heading>
                            <UnorderedList fontSize="sm" spacing={1}>
                                <ListItem><strong>Easy:</strong> 7 attempts</ListItem>
                                <ListItem><strong>Normal:</strong> 5 attempts</ListItem>
                                <ListItem><strong>Hard:</strong> 3 attempts</ListItem>
                            </UnorderedList>
                        </Box>

                        {/* Actions */}
                        <Box>
                            <Heading size="sm" mb={2}>💡 Special Actions</Heading>
                            <UnorderedList fontSize="sm" spacing={1}>
                                <ListItem><strong>Get Hint:</strong> Request a hint to help you guess the word.</ListItem>
                                <ListItem><strong>Reveal Letter:</strong> Reveal a letter in the word to make guessing easier, costs 1 attempt.</ListItem>
                            </UnorderedList>
                        </Box>

                        {/* Keyboard Usage */}
                        <Box>
                            <Heading size="sm" mb={2}>⌨️ Using the Keyboard</Heading>
                            <Text fontSize="sm">
                                Use your keyboard to guess letters directly. Press the corresponding key for your guess.
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" onClick={onClose}>
                        Got it!
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default HelpModal