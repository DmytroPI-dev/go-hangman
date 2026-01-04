package ui

import (
	"unicode"
	"hangman/hangman"
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

type GameUI struct {
	WordLabel *widget.Label
	Buttons map[rune]*widget.Button
	Drawer *HangmanDrawer
	Game *hangman.Game
	Window fyne.Window
}

func NewGameUI(g *hangman.Game, d *HangmanDrawer, w fyne.Window) *GameUI {
	ui := &GameUI{
		WordLabel: widget.NewLabelWithStyle("", fyne.TextAlignCenter, fyne.TextStyle{Monospace: true}),
		Buttons: make(map[rune]*widget.Button),
		Drawer: d,
		Game: g,
		Window: w,
	}
	ui.WordLabel.SetText(hangman.GetDisplayWord(g))

	return ui
}

func (ui *GameUI) HandleGuess(r rune) {
	r = unicode.ToLower(r)
	if ui.Game.MakeGuess(r) {
		ui.WordLabel.SetText(hangman.GetDisplayWord(ui.Game))
	} else {
		ui.Drawer.UpdateVisibility(ui.Game.IncorrectGuesses)
	}


	// 1. Process logic via the Game struct
	
	// 2. Disable the UI button if it exists in ui.Buttons
	// 3. Update the WordLabel
	// 4. Update the Drawer visibility
	// 5. Check for Win/Loss and show dialog.ShowInformation(...)
}



func (ui *GameUI) CreateKeyboard() fyne.CanvasObject {
	grid := container.NewGridWithColumns(9)
	
	for r := 'a'; r <= 'z'; r++ {
		letter := r // capture for closure
		btn := widget.NewButton(string(unicode.ToUpper(letter)), func() {
			ui.HandleGuess(letter)
		})
		ui.Buttons[letter] = btn
		grid.Add(btn)
	}
	
	return grid
}


func (ui *GameUI) BuildMainLayout() fyne.CanvasObject {
	// Combine everything:
	// Use container.NewVBox or NewBorder
	// Top: ui.Drawer.Visuals
	// Middle: ui.WordLabel
	// Bottom: ui.CreateKeyboard()
	return container.NewVBox() // placeholder
}