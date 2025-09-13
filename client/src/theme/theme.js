// src/theme/theme.js
import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          pink:       { value: "#f72585" },
          purple:     { value: "#7209b7" },
          deepPurple: { value: "#3a0ca3" },
          blue:       { value: "#4361ee" },
          lightBlue:  { value: "#4cc9f0" },
        },
      },
    },
  },
})
