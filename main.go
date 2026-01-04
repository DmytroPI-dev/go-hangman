package main

import (
	"fmt"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"hangman/hangman"
	"strings"
)

func main() {
	word, err := hangman.GetRandomWord()
	word = strings.ToLower(word)
	if err != nil { // Use hangman.GetRandomWord()
		fmt.Printf("error getting word: %s, using default word! ", err)
		word = "golang"
	}
	a := app.New()
	w := a.NewWindow("Hello")

	hello := widget.NewLabel("")
	w.SetContent(container.NewVBox(
		hello,
		widget.NewButton("Hi!", func() {
			hello.SetText("Welcome :)")
		}),
	))

	w.ShowAndRun()
}
