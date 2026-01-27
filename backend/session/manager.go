package session

import (
	"github.com/google/uuid"
	"hangman/backend/game"
	"sync"
)

// SessionManager manages game sessions.
type SessionManager struct {
	mu       sync.RWMutex
	sessions map[uuid.UUID]*game.Game
}

// NewSessionManager constructor creates a new SessionManager.
func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[uuid.UUID]*game.Game),
	}
}

// CreateSession creates a new game session and returns its UUID.
func (sm *SessionManager) CreateSession(game *game.Game) uuid.UUID {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sessionID := uuid.New()
	sm.sessions[sessionID] = game
	return sessionID
}

// GetSession retrieves a game session by its UUID.
func (sm *SessionManager) GetSession(sessionID uuid.UUID) (*game.Game, bool) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	game, exists := sm.sessions[sessionID]
	return game, exists
}

// DeleteSession deletes a game session by its UUID.
func (sm *SessionManager) DeleteSession(sessionID uuid.UUID) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	delete(sm.sessions, sessionID)
}
