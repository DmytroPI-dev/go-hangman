package game

import (
	"strings"
	"unicode"
)

type Game struct {
	TargetWord         string
	Hint               string
	GuessedLetters     map[rune]bool
	IncorrectGuesses   int
	CurrentWordState   []string
	MaxAttempts        int
	IsWordGuessed      bool
	GetDisplayWord     string
	Language           string
	OpenLetterAttempts int
}

func NewGame(targetWord, hint string, maxAttempts int, openLetterAttempts int, language string) *Game {
	currentWordState := make([]string, 0)
	for _, r := range targetWord {
		if unicode.IsLetter(r) {
			currentWordState = append(currentWordState, "_")
		}
	}

	return &Game{
		TargetWord:         targetWord,
		Hint:               hint,
		GuessedLetters:     make(map[rune]bool),
		IncorrectGuesses:   0,
		CurrentWordState:   currentWordState,
		MaxAttempts:        maxAttempts,
		Language:           language,
		OpenLetterAttempts: openLetterAttempts,
	}
}

func (gameInstance *Game) MakeGuess(letter rune) bool {
	letter = unicode.ToLower(letter)

	if gameInstance.GuessedLetters[letter] {
		return false
	}
	gameInstance.GuessedLetters[letter] = true

	correctGuess := false
	targetRunes := []rune(gameInstance.TargetWord)
	for i, char := range targetRunes {
		if unicode.ToLower(char) == letter {
			gameInstance.CurrentWordState[i] = string(char)
			correctGuess = true
		}
	}
	if !correctGuess {
		gameInstance.IncorrectGuesses++
	}
	return correctGuess
}

func IsWordGuessed(guessed []string, word string) bool {
	return strings.Join(guessed, "") == word
}

func (gameInstance *Game) IsGameOver() bool {
	return gameInstance.IncorrectGuesses >= gameInstance.MaxAttempts || IsWordGuessed(gameInstance.CurrentWordState, gameInstance.TargetWord)
}

func GetDisplayWord(gameInstance *Game) string {
	return strings.Join(gameInstance.CurrentWordState, " ")
}
