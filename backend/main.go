package main

import (
	handlers "hangman/backend/handlers"
	manager "hangman/backend/session"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	sessionManager := manager.NewSessionManager()
	handlers.NewGameHandler(sessionManager)

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://hangman-go-f62b3.web.app",
			"https://hangman-go-f62b3.web.app",
			"https://hgame.i-dmytro.org",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Routes
	router.POST("/api/game/new", handlers.NewGame)
	router.POST("/api/game/:session_id/guess", handlers.MakeGuess)
	router.POST("/api/game/:session_id/open_letter_attempts", handlers.OpenLetter)
	router.GET("/api/game/:session_id/state", handlers.GetState)
	router.GET("/api/game/:session_id/hint", handlers.GetHint)

	router.NoRoute(func(ctx *gin.Context) {
		ctx.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})

	router.Run(":8080")
}
