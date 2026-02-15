package game

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

// WordRecord represents a word entry with its hint and language.
type WordRecord struct {
	Text     string `json:"text"`
	Hint     string `json:"hint"`
	Language string `json:"language"` // e.g., "en", "pl", "ua"
}

// FirestoreQueryResult represents the result of a Firestore query.
type FirestoreQueryResult []struct {
	Document struct {
		Name   string `json:"name"`
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

// getEnvVars loads and returns required Firebase environment variables.
// Returns error if any required variable is missing and no fallbacks are available.
func getEnvVars() (string, string, error) {
	_ = godotenv.Load()

	firebaseProjectID := os.Getenv("FIREBASE_PROJECT_ID")
	if firebaseProjectID == "" {
		// Fallback for environments where env vars are not easily set (like WASM/fyne serve)
		firebaseProjectID = "hangman-go-f62b3"
	}

	firebaseAppID := os.Getenv("FIREBASE_APP_ID")
	if firebaseAppID == "" {
		// Fallback for environments where env vars are not easily set (like WASM/fyne serve)
		firebaseAppID = "go-hangman-v1"
	}

	if firebaseProjectID == "" {
		return "", "", fmt.Errorf("FIREBASE_PROJECT_ID environment variable is not set")
	}
	if firebaseAppID == "" {
		return "", "", fmt.Errorf("FIREBASE_APP_ID environment variable is not set")
	}
	return firebaseProjectID, firebaseAppID, nil
}

// FetchRandomWord fetches a random word from Firestore based on the specified language.
func FetchRandomWord(lang string) (*WordRecord, error) {
	firebaseProjectID, firebaseAppID, err := getEnvVars()
	if err != nil {
		return nil, err
	}

	// Generate a random index
	randomIndex := GenerateRandomIndex(20)

	// Construct Firestore document paths
	fullParentPath := fmt.Sprintf("projects/%s/databases/(default)/documents/artifacts/%s/public/data", firebaseProjectID, firebaseAppID)
	jumpToPath := fmt.Sprintf("%s/%s/%s", fullParentPath, lang, randomIndex)
	firebaseURL := fmt.Sprintf("https://firestore.googleapis.com/v1/%s:runQuery", fullParentPath)

	// Build Firestore query
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
					{"referenceValue": jumpToPath},
				},
			},
			"limit": 1,
		},
	}

	queryData, err := json.Marshal(query)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Firestore query: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	response, err := client.Post(firebaseURL, "application/json", bytes.NewBuffer(queryData))
	if err != nil {
		return nil, fmt.Errorf("failed to make HTTP request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Firestore API returned status: %s", response.Status)
	}

	var results FirestoreQueryResult
	if err := json.NewDecoder(response.Body).Decode(&results); err != nil {
		return nil, fmt.Errorf("failed to decode Firestore response: %w", err)
	}

	if len(results) == 0 || results[0].Document.Fields.Text.StringValue == "" {
		// Fallback to a predefined word if no result
		return fetchFallbackWord(firebaseProjectID, firebaseAppID, lang)
	}

	doc := results[0].Document
	return &WordRecord{
		Text:     doc.Fields.Text.StringValue,
		Hint:     doc.Fields.Hint.StringValue,
		Language: lang,
	}, nil
}

// fetchFallbackWord fetches a word from a predefined fallback location in Firestore.
func fetchFallbackWord(firebaseProjectID, firebaseAppID, lang string) (*WordRecord, error) {
	fallbackURL := fmt.Sprintf(
		"https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/artifacts/%s/public/data/%s?pageSize=1",
		firebaseProjectID, firebaseAppID, lang,
	)

	response, err := http.Get(fallbackURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make fallback HTTP request: %w", err)
	}
	defer response.Body.Close()

	var data struct {
		Documents []struct {
			Fields struct {
				Text struct {
					StringValue string `json:"stringValue"`
				} `json:"text"`
				Hint struct {
					StringValue string `json:"stringValue"`
				} `json:"hint"`
			} `json:"fields"`
		} `json:"documents"`
	}

	if err := json.NewDecoder(response.Body).Decode(&data); err != nil || len(data.Documents) == 0 {
		return nil, fmt.Errorf("failed to decode fallback response or no documents found")
	}
	return &WordRecord{
		Text:     data.Documents[0].Fields.Text.StringValue,
		Hint:     data.Documents[0].Fields.Hint.StringValue,
		Language: lang,
	}, nil
}

// GenerateRandomIndex creates a random string of the given length using alphanumeric characters.
func GenerateRandomIndex(length int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = letters[r.Intn(len(letters))]
	}
	return string(b)
}
