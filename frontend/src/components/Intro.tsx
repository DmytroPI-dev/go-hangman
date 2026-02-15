import {
    Box,
    HStack,
    VStack,
    Text,
    Center,
    Heading,
} from '@chakra-ui/react';
import { redMarginStyles, workbookPageStyles} from '../theme/workBookTheme';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, easeInOut } from 'framer-motion';


// --- ANIMATION VARIANTS ---
const drawPath = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
        const delay = 1 + i * 0.5;
        return {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay, duration: 1.5, ease: easeInOut },
                opacity: { delay, duration: 0.01 }
            }
        };
    }
};

const textFade = {
    hidden: { opacity: 0, y: 5 },
    visible: (delay: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: delay, duration: 0.5 }
    })
};

interface IntroProps {
    onComplete: () => void;
}

const MotionBox = motion.create(Box);
const MotionText = motion.create(Text);
const MotionPath = motion.create("path");


const Intro = ({ onComplete }: IntroProps) => {
    const [isFinished, setIsFinished] = useState(false);

    // Auto-restart or end signal after 8 seconds

    useEffect(() => {
        const timer = setTimeout(() => setIsFinished(true), 8500);
        return () => clearTimeout(timer);
    }, []);
    // Click handler to signal completion
    const handleClick = () => {
        onComplete();
        setIsFinished(true);
    };

    return (

        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.100" p={4}>
        <Box {...workbookPageStyles}>
            <Box {...redMarginStyles} />
            <Center minH="100vh" onClick={handleClick} cursor="pointer">

                <VStack spacing={10} mt={10}>
                    <Heading size="2xl" color="#1a2a6c" textAlign="center">
                        <MotionText
                            variants={textFade}
                            initial="hidden"
                            animate="visible"
                            custom={0.5}
                        >
                            Go Hangman!
                        </MotionText>
                    </Heading>

                    {/* SVG Drawing Area */}
                    <Box w="250px" h="250px" position="relative">
                        <svg viewBox="0 0 200 200" width="100%" height="100%">
                            <g fill="none" stroke="#1a2a6c" strokeWidth="3" strokeLinecap="round">
                                {/* Gallows Base */}
                                <MotionPath d="M 20 180 L 140 180" variants={drawPath} initial="hidden" animate="visible" custom={0} />
                                {/* Gallows Vertical */}
                                <MotionPath d="M 60 180 L 60 20" variants={drawPath} initial="hidden" animate="visible" custom={1} />
                                {/* Gallows Beam */}
                                <MotionPath d="M 60 20 L 130 20" variants={drawPath} initial="hidden" animate="visible" custom={2} />
                                {/* Rope */}
                                <MotionPath d="M 130 20 L 130 50" variants={drawPath} initial="hidden" animate="visible" custom={3} />

                                {/* Stick Figure Appearance (Delayed) */}
                                {/* Head */}
                                <MotionPath d="M 130 50 A 12 12 0 1 0 130 74 A 12 12 0 1 0 130 50" variants={drawPath} initial="hidden" animate="visible" custom={6} />
                                {/* Body */}
                                <MotionPath d="M 130 74 L 130 120" variants={drawPath} initial="hidden" animate="visible" custom={7} />
                                {/* Left Arm */}
                                <MotionPath d="M 130 85 L 110 100" variants={drawPath} initial="hidden" animate="visible" custom={8} />
                            </g>
                        </svg>
                    </Box>

                    {/* Word Display Animation */}
                    <VStack spacing={4}>
                        <HStack spacing={2}>
                            {["K", "O", "M", "P", "U", "T", "E", "R"].map((char, i) => (
                                <VStack key={i} spacing={0}>
                                    <MotionText
                                        fontSize="2xl"
                                        fontWeight="bold"
                                        color="#1a2a6c"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{
                                            opacity: i % 3 === 0 ? 1 : 0, // Only show some letters to look like a game
                                            scale: i % 3 === 0 ? 1 : 0.5
                                        }}
                                        transition={{ delay: 4 + i * 0.2 }}
                                    >
                                        {char}
                                    </MotionText>
                                    <MotionBox
                                        w="25px"
                                        h="2px"
                                        bg="#1a2a6c"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 3.5 + i * 0.1 }}
                                    />
                                </VStack>
                            ))}
                        </HStack>

                        <MotionText
                            mt={4}
                            fontSize="lg"
                            fontStyle="italic"
                            color="gray.600"
                            variants={textFade}
                            initial="hidden"
                            animate="visible"
                            custom={5.5}
                        >
                            Guess the word, save the hangman!
                        </MotionText>
                    </VStack>

                    <AnimatePresence>
                        {isFinished && (
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Text fontSize="xl" fontWeight="bold" color="red.500">
                                    Press anywhere to play!
                                </Text>
                            </MotionBox>
                        )}
                    </AnimatePresence>
                </VStack>
            </Center>
            </Box>
            </Box>

    );
}

export default Intro;