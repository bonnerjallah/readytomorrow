export const Colors = {
  light: {
    background: "#ffffff",      // warm off-white
    primary: "#77d1d2ff",         // vibrant orange
    title: "#1F2937",           // dark gray for strong contrast
    text: "#374151",            // medium-dark gray
    button: "#6c757d",          // fresh green
    buttontitle: "#FFFFFF",     // white button text
    placeholder: "#9CA3AF",    // soft gray
    tabIconColor: "#A8A29E",    // muted gray
    tabIconSelected: "#3e61c8ff", // highlight orange
    inputBackground: "#F3F4F6", // light gray input bg
    cardbackground: "#FFFFFF",  // white cards
    dropdownBackground: "#dee2e6"
  },
  dark: {
    background: "#1C1917",      // warm dark brownish-gray
    primary: "#77d1d2",         // softer orange
    title: "#F5F5F4",           // fallback for titles in dark mode
    text: "#F5F5F4",            // warm off-white
    button: "#6c757d",          // bright green
    buttontitle: "#1C1917",     // dark text on buttons
    placeholder: "#737373",     // muted gray
    tabIconColor: "#737373",    // inactive gray
    tabIconSelected: "#bfd7b5", // highlight orange
    inputBackground: "#292524", // dark input background
    cardbackground: "#292524",  // dark cards
    dropdownBackground: "#6c757d"

  }
}

export type ColorScheme = keyof typeof Colors;