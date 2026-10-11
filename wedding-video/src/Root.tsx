import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, H, W } from "./lib/theme";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return <Composition id="WeddingIntro" component={Main} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />;
};
