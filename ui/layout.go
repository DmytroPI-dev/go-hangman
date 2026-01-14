package ui

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
	"hangman/hangman"
	"unicode"
)

type GameUI struct {
	WordLabel *widget.Label
	Buttons   map[rune]*widget.Button
	Drawer    *HangmanDrawer
	Game      *hangman.Game
	Window    fyne.Window
}

func NewGameUI(w fyne.Window, d *HangmanDrawer) *GameUI {
	// Using theme.ForegroundColor() ensures visibility on both light and dark themes
	wordLabel := widget.NewLabelWithStyle("", fyne.TextAlignCenter, fyne.TextStyle{Monospace: true, Bold: true})

	return &GameUI{
		WordLabel: wordLabel,
		Buttons:   make(map[rune]*widget.Button),
		Drawer:    d,
		Window:    w,
	}
}

// StartNewGame initializes the game state and handles the async word fetch
func (ui *GameUI) StartNewGame() {
	// 1. Show loading state
	loadingLabel := widget.NewLabel("Getting new random word...")
	ui.Window.SetContent(container.NewCenter(loadingLabel))

	// 2. Fetch word in a background goroutine
	go func() {
		word, err := hangman.GetRandomWord()
		if err != nil {
			dialog.ShowError(err, ui.Window)
			return
		}

		// Update internal data state
		ui.Game = hangman.NewGame(word, 6)
		fyne.DoAndWait(func() {
			// Refresh Word Label and Drawer state
			ui.WordLabel.SetText(hangman.GetDisplayWord(ui.Game))
			ui.Drawer.UpdateVisibility(0)

			// Re-initialize the layout and listeners
			ui.SetContent()
		})
	}()
}

func (ui *GameUI) HandleGuess(r rune) {
	if ui.Game == nil || ui.Game.IsGameOver() {
		return
	}

	r = unicode.ToLower(r)

	if btn, ok := ui.Buttons[r]; ok {
		if !btn.Disabled() {
			btn.Disable()
		} else {
			return
		}
	}

	ui.Game.MakeGuess(r)
	ui.WordLabel.SetText(hangman.GetDisplayWord(ui.Game))
	ui.Drawer.UpdateVisibility(ui.Game.IncorrectGuesses)

	if ui.Game.IsGameOver() {
		title := "Game Over"
		msg := "The word was: " + ui.Game.TargetWord

		if hangman.IsWordGuessed(ui.Game.CurrentWordState, ui.Game.TargetWord) {
			title = "Congratulations!"
			msg = "You guessed it: " + ui.Game.TargetWord
		}

		dialog.ShowInformation(title, msg, ui.Window)

		for _, btn := range ui.Buttons {
			btn.Disable()
		}
	}
}

func (ui *GameUI) CreateKeyboard() fyne.CanvasObject {
	grid := container.NewGridWithColumns(9)
	for r := 'a'; r <= 'z'; r++ {
		letter := r
		btn := widget.NewButton(string(unicode.ToUpper(letter)), func() {
			ui.HandleGuess(letter)
		})
		ui.Buttons[letter] = btn
		grid.Add(btn)
	}
	return grid
}

func (ui *GameUI) BuildMainLayout() fyne.CanvasObject {
	keyboard := ui.CreateKeyboard()
	newGameBtn := widget.NewButtonWithIcon("New Game", theme.ViewRefreshIcon(), func() {
		ui.StartNewGame()
	})

	return container.NewVBox(
		container.NewCenter(ui.Drawer.Visuals),
		widget.NewSeparator(),
		ui.WordLabel,
		widget.NewSeparator(),
		keyboard,
		widget.NewSeparator(),
		newGameBtn,
	)
}

func (ui *GameUI) SetContent() {
	ui.Window.SetContent(ui.BuildMainLayout())
	ui.Window.Canvas().SetOnTypedRune(func(r rune) {
		ui.HandleGuess(r)
	})
}
