// Defino un tema personalizado para usar con Chakra
import {
  defineConfig,
  createSystem,
  defaultConfig,
  defineRecipe,
} from "@chakra-ui/react"

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: "md",
    color: "white",
    px: 4,
    py: 2,
  },
  variants: {
    variant: {
      brandBlue: {
        bg: "brand.blue",
        _hover: {
          filter: "brightness(1.1)", 
          transform: "translateY(-2px)",
          boxShadow: "md",
        },
      },
      brandPink: {
        bg: "brand.pink",
        _hover: {
          filter: "brightness(1.1)", 
          transform: "translateY(-2px)",
          boxShadow: "md",
        },
      },
    },
  },
  defaultVariants: {
    variant: "brandBlue", // opcional, para que tenga un valor por defecto
  },
})

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          pink: { value: "#f72585", light: { value: "#f984b8" } },
          blue: { value: "#4361ee", light: { value: "#4895ef" } },
          darkPurple: {value: "#3A0CA3", light: {value: "#9F7BEF"}},
          violet: {value: "#7209B7", light: {value: "#C89DF7"}}
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})

export const system = createSystem(defaultConfig, config)
