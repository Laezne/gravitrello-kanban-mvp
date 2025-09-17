// Paleta de colores para avatares
const colorPalette = [
  "red", "blue", "green", "yellow", "purple", 
  "orange", "pink", "teal", "cyan", "gray"
];

// Función que asigna un color de forma consistente basado en el nombre del usuario:
export const getAvatarColor = (name) => {
  if (!name) return "gray";
  const index = name.charCodeAt(0) % colorPalette.length;
  return colorPalette[index];
};

export { colorPalette };