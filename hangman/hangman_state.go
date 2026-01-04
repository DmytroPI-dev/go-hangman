package hangman

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"unicode"
)

var hangmanStates = []string{
	`
  +---+
  |   |
      |
      |
      |
      |
=========
`,
	`
  +---+
  |   |
  O   |
      |
      |
      |
=========
`,
	`
  +---+
  |   |
  O   |
  |   |
      |
      |
=========
`,
	`
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========
`,
	`
  +---+
  |   |
  O   |
 /|\  |
      |
      |
=========
`,
	`
  +---+
  |   |
  O   |
 /|\  |
 /    |
      |
=========
`,
	`
  +---+
  |   |
  O   |
 /|\  |
 / \  |
      |
=========
`}

type Game struct {
	TargetWord       string
	GuessedLetters   map[rune]bool
	IncorrectGuesses int
	CurrentWordState []string
	MaxAttempts      int
  IsGameOver bool
  IsWordGuessed bool
  GetDisplayWord string

}

func NewGame(targetWord string, maxAttempts int) *Game {
	currentWordState := make([]string, len(targetWord))
	for i := range currentWordState {
		currentWordState[i] = "_"
	}

	return &Game{
		TargetWord:       targetWord,
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

	correctGuess := false // Initialize correctGuess here
	for i, char := range g.TargetWord {
		if char == letter {
			g.CurrentWordState[i] = string(letter)
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

func IsGameOver(g *Game) bool {
	return g.IncorrectGuesses >= g.MaxAttempts || IsWordGuessed(g.CurrentWordState, g.TargetWord)
}

func GetDisplayWord(g *Game) string {
	return strings.Join(g.CurrentWordState, " ")
}

func GetRandomWord() (string, error) {
	apiURL := "https://random-word-api.vercel.app/api?words=1"

	responce, err := http.Get(apiURL)
	if err != nil {
		return "", fmt.Errorf("failed to make HTTP request: %v", err)
	}
	defer responce.Body.Close()

	if responce.StatusCode != http.StatusOK {
		return "", fmt.Errorf("incorrect status : %s", responce.Status)
	}

	body, err := io.ReadAll(responce.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read ersponce body: %s", err)
	}
	var words []string
	err = json.Unmarshal(body, &words)
	if err != nil {
		return "", fmt.Errorf("failed to proceed JSON : %s", err)
	}

	if len(words) == 0 {
		return "", fmt.Errorf("got empty word list")
	}
	return words[0], nil

}
