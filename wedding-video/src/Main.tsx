import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import "./lib/fonts";
import { Grain, Paper, SceneDur, SceneFade } from "./components/common";
import { Ending, Opening } from "./scenes/Bookends";
import { ChapterTitle, ShotScene } from "./scenes/Shots";
import { CHAPTERS } from "./storyboard";
import { TIMELINE, TOTAL_FRAMES } from "./timeline";
import { FPS } from "./lib/theme";

const Scene: React.FC<{ item: (typeof TIMELINE)[number] }> = ({ item }) => {
  switch (item.type) {
    case "opening":
      return <Opening />;
    case "ending":
      return <Ending />;
    case "title": {
      const ch = CHAPTERS[item.chapter];
      return <ChapterTitle word={ch.word} extra={ch.extra ?? []} no={ch.no} title={ch.title} en={ch.en} seed={500 + item.chapter} />;
    }
    case "shot":
      return <ShotScene shot={item.shot} seed={item.seed} />;
  }
};

export const Main: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Paper />
      {TIMELINE.map((item, i) => {
        const start = from;
        from += item.frames;
        return (
          <Sequence key={i} from={start} durationInFrames={item.frames} premountFor={FPS}>
            <SceneDur.Provider value={item.frames / FPS}>
              <SceneFade fadeIn={item.type === "opening" ? 1.5 : 0.7} fadeOut={item.type === "ending" ? 3 : 0.7}>
                <Scene item={item} />
              </SceneFade>
            </SceneDur.Provider>
          </Sequence>
        );
      })}
      <Grain />
      <Audio
        src={staticFile("audio/bgm.mp3")}
        loop
        volume={(f) => interpolate(f, [0, 2 * FPS, TOTAL_FRAMES - 6 * FPS, TOTAL_FRAMES], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};
