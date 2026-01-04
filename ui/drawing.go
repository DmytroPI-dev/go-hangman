package ui

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"image/color"
)

type HangmanDrawer struct {
	Visuals   *fyne.Container
	bodyParts []fyne.CanvasObject
}

func NewHangmanDrawer() *HangmanDrawer {
	strokeColor := color.Black
	strokeWidth := float32(3.0)

	// Static parts
	base := canvas.NewLine(strokeColor)
	base.Position1 = fyne.NewPos(50, 230)
	base.Position2 = fyne.NewPos(180, 230)
	base.StrokeWidth = strokeWidth
	pole := canvas.NewLine(strokeColor)
	pole.Position1 = fyne.NewPos(50, 230)
	pole.Position2 = fyne.NewPos(50, 20)
	pole.StrokeWidth = strokeWidth
	beam := canvas.NewLine(strokeColor)
	beam.Position1 = fyne.NewPos(50, 20)
	beam.Position2 = fyne.NewPos(150, 20)
	beam.StrokeWidth = strokeWidth

	// Dynamic parts
	// Mistake 1: Rope
	rope := canvas.NewLine(strokeColor)
	rope.Position1 = fyne.NewPos(150, 20)
	rope.Position2 = fyne.NewPos(150, 50)
	rope.StrokeWidth = 2.0

	// Mistake 2: Head
	head := canvas.NewCircle(color.Transparent)
	head.StrokeColor = strokeColor
	head.StrokeWidth = 2.0
	head.Resize(fyne.NewSize(30, 30))
	head.Move(fyne.NewPos(135, 50))

	// Mistake 3: Torso
	torso := canvas.NewLine(strokeColor)
	torso.Position1 = fyne.NewPos(150, 80)
	torso.Position2 = fyne.NewPos(150, 140)
	torso.StrokeWidth = 2.0

	// Mistake 4: Arms (Grouping both as one mistake or separate)
	leftArm := canvas.NewLine(strokeColor)
	leftArm.Position1 = fyne.NewPos(150, 90)
	leftArm.Position2 = fyne.NewPos(120, 120)
	rightArm := canvas.NewLine(strokeColor)
	rightArm.Position1 = fyne.NewPos(150, 90)
	rightArm.Position2 = fyne.NewPos(180, 120)
	leftArm.StrokeWidth = 2.0
	rightArm.StrokeWidth = 2.0
	arms := container.NewWithoutLayout(leftArm, rightArm)

	// Mistake 5: Left Leg
	leftLeg := canvas.NewLine(strokeColor)
	leftLeg.Position1 = fyne.NewPos(150, 140)
	leftLeg.Position2 = fyne.NewPos(120, 180)
	leftLeg.StrokeWidth = 2.0

	// Mistake 6: Right Leg
	rightLeg := canvas.NewLine(strokeColor)
	rightLeg.Position1 = fyne.NewPos(150, 140)
	rightLeg.Position2 = fyne.NewPos(180, 180)
	rightLeg.StrokeWidth = 2.0

	// Store dynamic parts in order
	bodyParts := []fyne.CanvasObject{rope, head, torso, arms, leftLeg, rightLeg}

	// Initially hide all body parts
	for _, p := range bodyParts {
		p.Hide()
	}

	// --- 3. Final Assembly ---
	visuals := container.NewWithoutLayout(
		base, pole, beam,
		rope, head, torso, arms, leftLeg, rightLeg,
	)
	// Set a minimum size for the container so it doesn't collapse.
	visuals = container.NewGridWrap(fyne.NewSize(200, 250), visuals)

	return &HangmanDrawer{
		Visuals:   visuals,
		bodyParts: bodyParts,
	}
}

// UpdateVisibility takes the number of incorrect guesses and reveals parts
func (h *HangmanDrawer) UpdateVisibility(incorrectCount int) {
	for i, part := range h.bodyParts {
		if i < incorrectCount {
			part.Show()
		} else {
			part.Hide()
		}
	}
	h.Visuals.Refresh()
}
