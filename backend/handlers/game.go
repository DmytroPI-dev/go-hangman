package handlers

import (
	game "hangman/backend/game"
	manager "hangman/backend/session"
	"net/http"
	"regexp"
	"strings"
	"unicode"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var sm *manager.SessionManager

func NewGameHandler(sessionManager *manager.SessionManager) {
	sm = sessionManager
}

type NewGameRequest struct {
	Language   string `json:"language"`   // "en", "pl", "ua"
	Difficulty string `json:"difficulty"` // "Easy", "Normal", Hard"
}

type NewGameResponse struct {
	SessionID          uuid.UUID `json:"session_id"`
	WordLength         int       `json:"word_length"`
	MaxAttempts        int       `json:"max_attempts"`
	OpenLetterAttempts int       `json:"open_letter_attempts"`
}

type GuessRequest struct {
	Letter string `json:"letter"`
}

type GuessResponse struct {
	Correct     bool   `json:"correct"`
	CurrentWord string `json:"current_word"`
	TriesLeft   int    `json:"tries_left"`
	IsGameOver  bool   `json:"is_game_over"`
	IsWon       bool   `json:"won"`
}

type GameStateResponse struct {
	CurrentWord string `json:"current_word"`
	TriesLeft   int    `json:"tries_left"`
	IsGameOver  bool   `json:"is_game_over"`
	IsWon       bool   `json:"won"`
}

// NewGame handles the creation of a new game session.
func NewGame(c *gin.Context) {
	var req NewGameRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Determine max attempts and openLetter attempts based on difficulty
	var maxAttempts, openLetterAttempts int
	switch req.Difficulty {
	case "Hard":
		maxAttempts = 3
		openLetterAttempts = 0
	case "Normal":
		maxAttempts = 5
		openLetterAttempts = 1
	case "Easy":
		maxAttempts = 7
		openLetterAttempts = 2
	default:
		maxAttempts = 7
		openLetterAttempts = 2
	}

	word, err := game.FetchRandomWord(req.Language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch word"})
		return
	}
	// Create a new game instance
	gameInstance := game.NewGame(word.Text, word.Hint, maxAttempts, openLetterAttempts, req.Language)
	// Create a new session for the game
	sessionID := sm.CreateSession(gameInstance)
	letterCount := 0
	for _, char := range word.Text {
		if unicode.IsLetter(char) {
			letterCount++
		}
	}
	resp := NewGameResponse{
		SessionID:          sessionID,
		WordLength:         letterCount,
		MaxAttempts:        maxAttempts,
		OpenLetterAttempts: openLetterAttempts,
	}
	c.JSON(http.StatusOK, resp)
}

// MakeGuess handles a letter guess for a specific game session.
func MakeGuess(c *gin.Context) {
	var req GuessRequest

	gameInstance, ok := getGameInstance(c)
	if !ok {
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil || len(req.Letter) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid guess"})
		return
	}

	if gameInstance.Language == "ua" {
		matched, _ := regexp.MatchString(`^[\p{Cyrillic}']$`, req.Letter)
		if !matched {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid letter for Ukrainian language"})
			return
		}
	}

	letterToRunes := []rune(req.Letter)
	letter := unicode.ToLower(letterToRunes[0])
	correct := gameInstance.MakeGuess(letter)

	isGameOver := gameInstance.IsGameOver()
	isWon := game.IsWordGuessed(gameInstance.CurrentWordState, gameInstance.TargetWord)

	if isGameOver && !isWon {
		// If the game is over and the player lost, openLetter the word
		wordStateIdx := 0
		for _, char := range gameInstance.TargetWord {
			if unicode.IsLetter(char) {
				gameInstance.CurrentWordState[wordStateIdx] = string(char)
				wordStateIdx++
			}
		}
	}

	resp := GuessResponse{
		Correct:     correct,
		CurrentWord: strings.Join(gameInstance.CurrentWordState, " "),
		TriesLeft:   gameInstance.MaxAttempts - gameInstance.IncorrectGuesses,
		IsGameOver:  isGameOver,
		IsWon:       isWon,
	}
	c.JSON(http.StatusOK, resp)
}

// GetState retrieves the current state of a specific game session.
func GetState(c *gin.Context) {
	gameInstance, ok := getGameInstance(c)
	if !ok {
		return
	}

	isGameOver := gameInstance.IsGameOver()
	isWon := game.IsWordGuessed(gameInstance.CurrentWordState, gameInstance.TargetWord)

	resp := GameStateResponse{
		CurrentWord: strings.Join(gameInstance.CurrentWordState, " "),
		TriesLeft:   gameInstance.MaxAttempts - gameInstance.IncorrectGuesses,
		IsGameOver:  isGameOver,
		IsWon:       isWon,
	}
	c.JSON(http.StatusOK, resp)
}

// GetHint provides the hint for the target word in a specific game session.
func GetHint(c *gin.Context) {
	gameInstance, ok := getGameInstance(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{"hint": gameInstance.Hint})
}

// OpenLetter opens one unguessed letter from the target word in a specific game session.
func OpenLetter(c *gin.Context) {
	gameInstance, ok := getGameInstance(c)
	if !ok {
		return
	}

	if gameInstance.MaxAttempts-gameInstance.IncorrectGuesses <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No more attempts left"})
		return
	}
	if gameInstance.OpenLetterAttempts <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No more open letter attempts left"})
		return
	}

	// OpenLetter one letter and increment incorrect guesses
	for i, char := range gameInstance.TargetWord {
		if gameInstance.CurrentWordState[i] == "_" && unicode.IsLetter(char) {
			gameInstance.CurrentWordState[i] = string(char)
			gameInstance.IncorrectGuesses++
			gameInstance.OpenLetterAttempts--
			break
		}
	}

	isGameOver := gameInstance.IsGameOver()
	isWon := game.IsWordGuessed(gameInstance.CurrentWordState, gameInstance.TargetWord)

	// Same openLetter logic as MakeGuess
	if isGameOver && !isWon {
		wordStateIdx := 0
		for _, char := range gameInstance.TargetWord {
			if unicode.IsLetter(char) {
				gameInstance.CurrentWordState[wordStateIdx] = string(char)
				wordStateIdx++
			}
		}
	}

	resp := GuessResponse{
		Correct:     true,
		CurrentWord: strings.Join(gameInstance.CurrentWordState, " "),
		TriesLeft:   gameInstance.MaxAttempts - gameInstance.IncorrectGuesses,
		IsGameOver:  isGameOver,
		IsWon:       isWon,
	}
	c.JSON(http.StatusOK, resp)
}

// getGameInstance is a helper function to extract, validate, and retrieve
// a game session from the request context and session manager.
func getGameInstance(c *gin.Context) (*game.Game, bool) {
	sessionIDStr := c.Param("session_id")

	// 1. Parse UUID
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session ID"})
		return nil, false
	}

	// 2. Retrieve instance from the package-level variable 'sm'
	gameInstance, exists := sm.GetSession(sessionID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return nil, false
	}

	return gameInstance, true
}
