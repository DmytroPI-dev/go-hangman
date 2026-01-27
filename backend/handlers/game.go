package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	game "hangman/backend/game"
	manager "hangman/backend/session"
	"net/http"
	"strings"
	"unicode"
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
	SessionID   uuid.UUID `json:"session_id"`
	WordLength  int       `json:"word_length"`
	MaxAttempts int       `json:"max_attempts"`
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
	// Determine max attempts based on difficulty
	var maxAttempts int
	switch req.Difficulty {
	case "Hard":
		maxAttempts = 3
	case "Normal":
		maxAttempts = 5
	default:
		maxAttempts = 7
	}

	word, err := game.FetchRandomWord(req.Language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch word"})
		return
	}
	// Create a new game instance
	gameInstance := game.NewGame(word.Text, word.Hint, maxAttempts)
	// Create a new session for the game
	sessionID := sm.CreateSession(gameInstance)
	resp := NewGameResponse{
		SessionID:   sessionID,
		WordLength:  len(word.Text),
		MaxAttempts: maxAttempts,
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

	letterToRunes := []rune(req.Letter)
	letter := unicode.ToLower(letterToRunes[0])
	correct := gameInstance.MakeGuess(letter)

	isGameOver := gameInstance.IsGameOver()
	isWon := game.IsWordGuessed(gameInstance.CurrentWordState, gameInstance.TargetWord)

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

// RevealLetter reveals one unguessed letter from the target word in a specific game session.
func RevealLetter(c *gin.Context) {
	gameInstance, ok := getGameInstance(c)
	if !ok {
		return
	}

	if gameInstance.MaxAttempts-gameInstance.IncorrectGuesses > 0 {
		for i, char := range gameInstance.TargetWord {
			if gameInstance.CurrentWordState[i] == "_" && unicode.IsLetter(char) {
				gameInstance.CurrentWordState[i] = string(char)
				gameInstance.IncorrectGuesses++
				break
			}
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No more attempts left to reveal a letter"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"current_word": strings.Join(gameInstance.CurrentWordState, " ")})
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
