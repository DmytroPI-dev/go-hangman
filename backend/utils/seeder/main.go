package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// WordEntry represents a single word and its hint
type WordEntry struct {
	Text string `json:"text"`
	Hint string `json:"hint"`
}

// FirestoreResponse handles the JSON structure for GET requests
type FirestoreResponse struct {
	Documents []struct {
		Fields struct {
			Text struct {
				StringValue string `json:"stringValue"`
			} `json:"text"`
		} `json:"fields"`
	} `json:"documents"`
}

func main() {
	// 1. Load the .env file
	_ = godotenv.Load()

	// 2. Fetch configuration
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	appId := os.Getenv("FIREBASE_APP_ID")
	wordsFilePath := os.Getenv("WORDS_FILE_PATH")

	if appId == "" {
		appId = "go-hangman-v1"
	}
	if wordsFilePath == "" {
		wordsFilePath = "words.json"
	}

	if projectID == "" {
		fmt.Println("❌ Error: FIREBASE_PROJECT_ID is not set.")
		return
	}

	// 3. Load Word Bank from File
	fileData, err := os.ReadFile(wordsFilePath)
	if err != nil {
		fmt.Printf("❌ Error reading file: %v\n", err)
		return
	}

	var wordBank map[string][]WordEntry
	if err := json.Unmarshal(fileData, &wordBank); err != nil {
		fmt.Printf("❌ Error parsing JSON: %v\n", err)
		return
	}

	// 4. PRE-FLIGHT CHECK: Internal duplicates
	fmt.Println("🔍 Validating local word bank for internal duplicates...")
	for lang, words := range wordBank {
		seen := make(map[string]int)
		for _, w := range words {
			seen[strings.ToUpper(strings.TrimSpace(w.Text))]++
		}
		for word, count := range seen {
			if count > 1 {
				fmt.Printf("🛑 Internal Error: '%s' appears %d times in local [%s] list.\n", word, count, lang)
				return
			}
		}
	}

	// 5. Database Seed Logic with Remote Duplicate Check
	baseURL := "https://firestore.googleapis.com/v1/projects/" + projectID + "/databases/(default)/documents/artifacts/" + appId + "/public/data"
	client := &http.Client{Timeout: 10 * time.Second}

	fmt.Println("🚀 Starting synchronized database seed...")

	for lang, words := range wordBank {
		targetURL := fmt.Sprintf("%s/%s", baseURL, lang)

		// A. Fetch existing words from Firestore to avoid duplicates
		fmt.Printf("📡 Checking remote duplicates for [%s]...\n", lang)
		existingWords := make(map[string]bool)
		resp, err := client.Get(targetURL)
		if err == nil && resp.StatusCode == http.StatusOK {
			var remoteData FirestoreResponse
			if err := json.NewDecoder(resp.Body).Decode(&remoteData); err == nil {
				for _, doc := range remoteData.Documents {
					existingWords[strings.ToUpper(doc.Fields.Text.StringValue)] = true
				}
			}
			resp.Body.Close()
		}

		// B. Upload only new words
		for _, w := range words {
			cleanText := strings.ToUpper(strings.TrimSpace(w.Text))

			if existingWords[cleanText] {
				fmt.Printf("⏭️  Skipping: %s (Already in database)\n", cleanText)
				continue
			}

			payload := map[string]interface{}{
				"fields": map[string]interface{}{
					"text": map[string]interface{}{"stringValue": cleanText},
					"hint": map[string]interface{}{"stringValue": w.Hint},
				},
			}

			jsonData, _ := json.Marshal(payload)
			postResp, err := http.Post(targetURL, "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				fmt.Printf("❌ [%s] Network error sending %s: %v\n", lang, cleanText, err)
				continue
			}

			if postResp.StatusCode == 200 || postResp.StatusCode == 201 {
				fmt.Printf("✅ [%s] Imported: %s\n", lang, cleanText)
			} else {
				fmt.Printf("❌ [%s] Failed: %s (Status: %d)\n", lang, cleanText, postResp.StatusCode)
			}
			postResp.Body.Close()
		}
	}

	fmt.Println("\n✨ Seed complete.")
}
