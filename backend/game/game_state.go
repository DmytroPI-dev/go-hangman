package game

import (
	"strings"
	"unicode"
)

type Game struct {
	TargetWord       string
	Hint             string
	GuessedLetters   map[rune]bool
	IncorrectGuesses int
	CurrentWordState []string
	MaxAttempts      int
	IsWordGuessed    bool
	GetDisplayWord   string
	Language         string
}

func NewGame(targetWord, hint string, maxAttempts int) *Game {
    currentWordState := make([]string, 0)  
    for _, r := range targetWord {
        if unicode.IsLetter(r) {
            currentWordState = append(currentWordState, "_")
        }
    }

    return &Game{
        TargetWord:       targetWord,
        Hint:             hint,
        GuessedLetters:   make(map[rune]bool),
        IncorrectGuesses: 0,
        CurrentWordState: currentWordState,
        MaxAttempts:      maxAttempts,
    }
}

func (g *Game) MakeGuess(letter rune) bool {
	letter = unicode.ToLower(letter)

	if g.GuessedLetters[letter] {
		return false
	}
	g.GuessedLetters[letter] = true

	correctGuess := false
	targetRunes := []rune(g.TargetWord)
	for i, char := range targetRunes {
		if unicode.ToLower(char) == letter {
			g.CurrentWordState[i] = string(char)
			correctGuess = true
		}
	}
	if !correctGuess {
		g.IncorrectGuesses++
	}
	return correctGuess
}

func IsWordGuessed(guessed []string, word string) bool {
	return strings.Join(guessed, "") == word
}

func (g *Game) IsGameOver() bool {
	return g.IncorrectGuesses >= g.MaxAttempts || IsWordGuessed(g.CurrentWordState, g.TargetWord)
}

func GetDisplayWord(g *Game) string {
	return strings.Join(g.CurrentWordState, " ")
}
