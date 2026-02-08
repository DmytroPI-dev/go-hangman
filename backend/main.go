package main

import (
    "time"
    "github.com/joho/godotenv"
    "os"
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    handlers "hangman/backend/handlers"
    manager "hangman/backend/session"
)


func getEnvVars() (string, string, error) {
	_ = godotenv.Load()
	firebaseProjectMainURL := os.Getenv("FIREBASE_MAIN_URL")
	firebaseProjectAlternativeURL := os.Getenv("FIREBASE_ALTERNATIVE_URL")
	return firebaseProjectMainURL, firebaseProjectAlternativeURL, nil
}

func main() {
    router := gin.Default()
    sessionManager := manager.NewSessionManager()
    handlers.NewGameHandler(sessionManager)

    // Load environment variables
    firebaseMainURL, firebaseAlternativeURL, err := getEnvVars()
    if err != nil {
        panic("Failed to load environment variables")
    }

    // Configure CORS
    router.Use(cors.New(cors.Config{
        AllowOrigins: []string{
            "http://localhost:5173",                    
            firebaseMainURL,                            
            firebaseAlternativeURL,                     
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
    router.POST("/api/game/:session_id/reveal", handlers.RevealLetter)
    router.GET("/api/game/:session_id/state", handlers.GetState)
    router.GET("/api/game/:session_id/hint", handlers.GetHint)
    
    router.NoRoute(func(ctx *gin.Context) {
        ctx.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
    })
    
    router.Run(":8080")
}