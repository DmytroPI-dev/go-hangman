package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Firestore field structures for parsing response
type RunQueryResponse []struct {
	Document struct {
		Fields struct {
			Text struct {
				StringValue string `json:"stringValue"`
			} `json:"text"`
			Hint struct {
				StringValue string `json:"stringValue"`
			} `json:"hint"`
		} `json:"fields"`
	} `json:"document"`
}

func main() {
	_ = godotenv.Load()

	// 1. Setup Configuration
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	appId := "go-hangman-v1" // Matches our seeder and firestore structure
	lang := "pl"             // Change this to "en" or "ua" to test other collections

	if projectID == "" {
		fmt.Println("❌ Error: FIREBASE_PROJECT_ID environment variable is not set.")
		return
	}

	fmt.Printf("📡 Fetching random word from [%s] collection...\n", lang)

	// 2. Implementation of the "Random Jump" logic
	// We generate a random string to use as a starting point in the index
	randomKey := generateRandomID(20)

	// Full internal path used by Firestore for reference values
	fullParentPath := fmt.Sprintf("projects/%s/databases/(default)/documents/artifacts/%s/public/data", projectID, appId)
	jumpPoint := fmt.Sprintf("%s/%s/%s", fullParentPath, lang, randomKey)

	// Structured Query: Jump to a random spot in the index and take exactly 1 document
	query := map[string]any{
		"structuredQuery": map[string]any{
			"from": []map[string]any{
				{"collectionId": lang},
			},
			"orderBy": []map[string]any{
				{
					"field":     map[string]string{"fieldPath": "__name__"},
					"direction": "ASCENDING",
				},
			},
			"startAt": map[string]any{
				"values": []map[string]any{
					{"referenceValue": jumpPoint},
				},
			},
			"limit": 1,
		},
	}

	url := fmt.Sprintf("https://firestore.googleapis.com/v1/%s:runQuery", fullParentPath)

	jsonData, _ := json.Marshal(query)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ Connection error: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("❌ Database error: %d. Check if your Security Rules allow public read.\n", resp.StatusCode)
		return
	}

	var results RunQueryResponse
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		fmt.Printf("❌ Error parsing JSON: %v\n", err)
		return
	}

	// 3. Handle results and print
	if len(results) == 0 || results[0].Document.Fields.Text.StringValue == "" {
		fmt.Println("⚠️  Query returned no results (jumped past the end of the collection).")
		fmt.Println("In a real app, you would fallback to fetching the first document here.")
		return
	}

	word := results[0].Document.Fields.Text.StringValue
	hint := results[0].Document.Fields.Hint.StringValue

	fmt.Println("\n✅ Successfully retrieved random item:")
	fmt.Printf("------------------------------\n")
	fmt.Printf("WORD: %s\n", word)
	fmt.Printf("HINT: %s\n", hint)
	fmt.Printf("------------------------------\n")
}

// generateRandomID creates a random string to simulate a Firestore Document ID
func generateRandomID(n int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, n)
	for i := range b {
		b[i] = charset[r.Intn(len(charset))]
	}
	return string(b)
}
