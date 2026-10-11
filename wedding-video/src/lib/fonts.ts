import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const fonts: [string, string, string, string][] = [
  ["Gowun Batang", "fonts/GowunBatang-400.ttf", "400", "normal"],
  ["Gowun Batang", "fonts/GowunBatang-700.ttf", "700", "normal"],
  ["Cormorant Garamond", "fonts/Cormorant-400.ttf", "400", "normal"],
  ["Cormorant Garamond", "fonts/Cormorant-500.ttf", "500", "normal"],
  ["Cormorant Garamond", "fonts/Cormorant-400i.ttf", "400", "italic"],
  ["Homemade Apple", "fonts/HomemadeApple.ttf", "400", "normal"],
  ["DM Mono", "fonts/DMMono-400.ttf", "400", "normal"],
  ["DM Mono", "fonts/DMMono-500.ttf", "500", "normal"],
];

for (const [family, file, weight, style] of fonts) {
  loadFont({ family, url: staticFile(file), weight, style });
}
