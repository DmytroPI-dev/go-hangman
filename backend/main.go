package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	handlers "hangman/backend/handlers"
	manager "hangman/backend/session"
)

func main() {
	router := gin.Default()
	sessionManager := manager.NewSessionManager()
	handlers.NewGameHandler(sessionManager)
	router.Use(cors.Default())
	router.POST("/api/game/new", handlers.NewGame)
	router.POST("/api/game/:session_id/guess", handlers.MakeGuess)
	router.POST("/api/game/:session_id/reveal", handlers.RevealLetter)
	router.GET("/api/game/:session_id/state", handlers.GetState)
	router.GET("/api/game/:session_id/hint", handlers.GetHint)
	router.NoRoute(func(ctx *gin.Context) {
		ctx.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	})
	router.Run(":8080")
}
