package hangman

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"unicode/utf8"
)




func main() {
	word, err := getRandomWord()
	word = strings.ToLower(word)
	if err != nil{
		fmt.Printf("error getting word: %s, using default word! ",err )
		word = "golang"
	}
	const maxAttempts = 6
	attempts := maxAttempts
	currentWordState := initializeCurrentWord(word)
	scanner := bufio.NewScanner(os.Stdin)
	guessedLetters := make(map[string]bool)
	fmt.Printf("Welcome to Hangman!")
	for attempts > 0 {
		displayCurrentState(currentWordState, attempts)
		userInput, _ := getUserInput(scanner)
		if !isValidInput(userInput) {
			fmt.Println("Invalid Input! Please, enter a single letter!")
			continue
		}
		if guessedLetters[userInput] {
			fmt.Println(" You've already guessed that letter.")
			continue
		}
		guessedLetters[userInput] = true
		correctGuess := updateGuessed(word, currentWordState, userInput)

		if !correctGuess {
			attempts--
		}

		displayHangman(maxAttempts - attempts)

		if isWordGuessed(currentWordState, word) {
			fmt.Printf("Congratulations! You've guessed the word, it was '%s' \n", word)
			return
		}
		if attempts == 0 {
			fmt.Println("Game over! The word was: ", word)
			return
		}

	}

}

func getRandomWord() (string, error) {
	apiURL := "https://random-word-api.vercel.app/api?words=1"

	responce, err := http.Get(apiURL)
	if err !=nil {
		return "", fmt.Errorf("failed to make HTTP request: %v", err)
	}
	defer responce.Body.Close()

	if responce.StatusCode != http.StatusOK {
		return "", fmt.Errorf("incorrect status : %s", responce.Status)
	}

	body, err := io.ReadAll(responce.Body)
	if err !=  nil {
		return "", fmt.Errorf("failed to read ersponce body: %s", err)
	}
	var words []string
	err = json.Unmarshal(body, &words)
	if err != nil {
		return "", fmt.Errorf("failed to proceed JSON : %s", err)
	}

	if len(words) ==0 {
		return "", fmt.Errorf("got empty word list")
	}
	return words[0], nil

}

func isWordGuessed(guessed []string, word string) bool {
	return strings.Join(guessed, "") == word
}

func displayHangman(incorrectGuesses int) {
	if incorrectGuesses >= 0 && incorrectGuesses < len(hangmanStates) {
		fmt.Println(hangmanStates[incorrectGuesses])
	}
}

func updateGuessed(word string, guessed []string, letter string) bool {
	correctGuess := false
	for i, char := range word {
		if string(char) == letter {
			guessed[i] = letter
			correctGuess = true
		}
	}
	return correctGuess
}

func isValidInput(input string) bool {
	return utf8.RuneCountInString(input) == 1
}

func getUserInput(scanner *bufio.Scanner) (string, error) {
	scanner.Scan()
	if err := scanner.Err(); err != nil {
		return "", fmt.Errorf("error reading input, %v", err)
	}
	return scanner.Text(), nil

}

func initializeCurrentWord(word string) []string {
	currentWordState := make([]string, len(word))
	for i := range currentWordState {
		currentWordState[i] = "_"

	}

	return currentWordState
}

func displayCurrentState(currentWordState []string, attempts int) {
	fmt.Println("Current word state: ", strings.Join(currentWordState, " "))
	fmt.Println("Attempts left: ", attempts)
}
