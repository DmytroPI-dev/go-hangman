package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"hangman/ui"
)

func main() {
	myApplication := app.New()
	gameWindow := myApplication.NewWindow("Go Hangman")
	drawer := ui.NewHangmanDrawer()
	gameUI := ui.NewGameUI(gameWindow, drawer)
	gameUI.StartNewGame()
	gameWindow.Resize(fyne.NewSize(400, 600))
	gameWindow.ShowAndRun()
}
