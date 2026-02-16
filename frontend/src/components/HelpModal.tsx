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
import { useTranslation } from 'react-i18next'

interface HelpModalProps {
    isOpen: boolean
    onClose: () => void
}

function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center">🎯 {t('help.howToPlay')}</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {/* Game Rules */}
                        <Box>
                            <Text fontSize={{ base: "xl", md: "xl" }}>
                                {t('help.rules')}
                            </Text>
                        </Box>

                        {/* Difficulty Levels */}
                        <Box>
                            <Heading size="sm" mb={2} fontSize={{ base: "xl", md: "xl" }}>⚙️ {t('help.difficultyLevels')}</Heading>
                            <UnorderedList style={{ listStyleType: "none" }} fontSize={{ base: "xl", md: "xl" }} spacing={1}>
                                <ListItem><strong>{t('help.difficulties.easy')}:</strong> 7 {t('help.attempts')}</ListItem>
                                <ListItem><strong>{t('help.difficulties.normal')}:</strong> 5 {t('help.attempts')}</ListItem>
                                <ListItem><strong>{t('help.difficulties.hard')}:</strong> 3 {t('help.attempts')}</ListItem>
                            </UnorderedList>
                        </Box>

                        {/* Controls */}
                        <Box>
                            <Heading size="sm" mb={2} fontSize={{ base: "xl", md: "xl" }}>🕹️ {t('help.controls')}</Heading>
                            <UnorderedList style={{ listStyleType: "none" }} fontSize={{ base: "xl", md: "xl" }} spacing={1}>
                                <ListItem><strong>💡 {t('help.getHint')}:</strong> {t('help.hintDescription')}</ListItem>
                                <ListItem><strong>🔍 {t('help.openLetter')}:</strong> {t('help.openLetterDescription')}</ListItem>
                                <ListItem><strong>🎮 {t('help.newGame')}:</strong> {t('help.newGameDescription')}</ListItem>
                            </UnorderedList>
                        </Box>

                        {/* Keyboard Usage */}
                        <Box>
                            <Heading size="sm" mb={2} fontSize={{ base: "xl", md: "xl" }}>⌨️ {t('help.usingKeyboard')}</Heading>
                            <Text fontSize={{ base: "xl", md: "xl" }}>
                                {t('help.keyboardDescription')}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="green" onClick={onClose} size={{ base: "md", md: "lg" }} fontSize={{ base: "xl", md: "xl" }}>
                        {t('help.gotIt')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default HelpModal