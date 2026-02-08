import { Box } from "@chakra-ui/react";
import type { Difficulty } from "../types/game";
import type { JSX } from "react/jsx-dev-runtime";

// HangmanDraw component to visually represent the hangman based on the number of incorrect guesses
interface HangmanDrawProps {
    incorrectGuesses: number;
    difficulty: Difficulty
}

// Component to draw the hangman based on the number of incorrect guesses
function HangmanDraw({ incorrectGuesses, difficulty }: HangmanDrawProps) {

    const gallows = [
        <line key="basement" x1="10" y1="150" x2="150" y2="150" stroke="black" strokeWidth="4" />,
        <line key="pole" x1="30" y1="150" x2="30" y2="20" stroke="black" strokeWidth="4" />,
        <line key="beam" x1="30" y1="20" x2="100" y2="20" stroke="black" strokeWidth="4" />
    ]

    const allParts = [
        <line key="rope" x1="100" y1="20" x2="100" y2="40" stroke="black" strokeWidth="4" />,
        <circle key="head" cx="100" cy="50" r="10" stroke="black" strokeWidth="4" fill="none" />,
        <line key="body" x1="100" y1="60" x2="100" y2="100" stroke="black" strokeWidth="4" />,
        <line key="leftArm" x1="100" y1="70" x2="80" y2="90" stroke="black" strokeWidth="4" />,
        <line key="rightArm" x1="100" y1="70" x2="120" y2="90" stroke="black" strokeWidth="4" />,
        <line key="leftLeg" x1="100" y1="100" x2="80" y2="130" stroke="black" strokeWidth="4" />,
        <line key="rightLeg" x1="100" y1="100" x2="120" y2="130" stroke="black" strokeWidth="4" />
    ]

    let bodyParts: JSX.Element[][] = [];
    switch (difficulty) {
        case "Hard":
            bodyParts = [
                [allParts[0], allParts[1]],
                [allParts[2], allParts[3], allParts[4]],
                [allParts[5], allParts[6]]];
            break;
        case "Normal":
            bodyParts = [
                [allParts[0]],
                [allParts[1]],
                [allParts[2]],
                [allParts[3], allParts[4]],
                [allParts[5], allParts[6]]
            ];
            break;
        default:
            bodyParts = allParts.map(part => [part]);
    }

    return (
        <Box w="200px" h="200px" mx="auto">
            <svg width="200" height="200">
                {gallows}
                {bodyParts.slice(0, incorrectGuesses).map((group, idx) => (
                    <g key={idx}>{group}</g>
                ))}
            </svg>
        </Box>
    )
}

export default HangmanDraw;