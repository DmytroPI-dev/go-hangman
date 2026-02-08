import { extendTheme } from "@chakra-ui/react";

export const workbookTheme = extendTheme({
  fonts: {
    heading: "'Caveat', cursive",
    body: "'Caveat', cursive",
  },
  styles: {
    global: {
      body: {
        bg: "#f0f0f0", // Light gray background
      }
    }
  }
})

// Reusable workbook page styles
export const workbookPageStyles = {
  w: "full",
  maxW: "900px",
  minH: "600px",
  bg: "#fdfdfd",
  position: "relative" as const,
  boxShadow: "xl",
  p: 8,
  borderRadius: "sm",
  border: "1px solid #d1d1d1",
  overflow: "hidden" as const,
  // Graph paper background
  backgroundImage: `
    linear-gradient(to bottom, rgba(0, 150, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to right, rgba(0, 150, 255, 0.1) 1px, transparent 1px)
  `,
  backgroundSize: "30px 30px"
}

// Red margin line component props
export const redMarginStyles = {
  position: "absolute" as const,
  right: "45px",
  top: "0",
  bottom: "0",
  w: "2px",
  bg: "rgba(255, 0, 0, 0.2)"
}