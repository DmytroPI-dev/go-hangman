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
  },

  brekpoints: {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
  }
})

// Responsive workbook page styles
export const workbookPageStyles = {
  w: "full",
  maxW: { base: "100%", md: "900px" },  // Full width on mobile, 900px on desktop
  minH: { base: "100vh", md: "600px" }, // Full viewport on mobile
  bg: "#fdfdfd",
  position: "relative" as const,
  boxShadow: { base: "none", md: "xl" }, // No shadow on mobile
  p: { base: 4, md: 8 },  // Less padding on mobile
  borderRadius: { base: 0, md: "sm" },  // No rounded corners on mobile
  border: { base: "none", md: "1px solid #d1d1d1" },
  overflow: "hidden" as const,
  backgroundImage: `
    linear-gradient(to right, rgba(0, 150, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 150, 255, 0.1) 1px, transparent 1px)
  `,
  backgroundSize: { base: "20px 20px", md: "30px 30px" }  // Smaller grid on mobile
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