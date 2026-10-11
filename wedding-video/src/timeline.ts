import { CHAPTER_TITLE_DUR, CHAPTERS, ENDING_DUR, OPENING_DUR, OPENING_SHOTS, Shot, shotDur } from "./storyboard";
import { FPS } from "./lib/theme";

/** 영상 전체 길이(초). 사진 장면 길이를 자동으로 늘리고 줄여 정확히 맞춥니다 */
export const TARGET_SECONDS = 600;

export type Item =
  | { type: "opening"; frames: number }
  | { type: "ending"; frames: number }
  | { type: "title"; frames: number; chapter: number }
  | { type: "shot"; frames: number; shot: Shot; seed: number };

const build = (): Item[] => {
  type Raw = (
    | { type: "opening" | "ending" }
    | { type: "title"; chapter: number }
    | { type: "shot"; shot: Shot; seed: number }
  ) & { sec: number; flex: boolean };
  const raw: Raw[] = [];
  raw.push({ type: "opening", sec: OPENING_DUR, flex: false });
  let seed = 100;
  OPENING_SHOTS.forEach((shot) => raw.push({ type: "shot", shot, seed: seed++, sec: shotDur(shot), flex: !shot.dur }));
  CHAPTERS.forEach((ch, i) => {
    raw.push({ type: "title", chapter: i, sec: CHAPTER_TITLE_DUR, flex: false });
    ch.shots.forEach((shot) => raw.push({ type: "shot", shot, seed: seed++, sec: shotDur(shot), flex: !shot.dur }));
  });
  raw.push({ type: "ending", sec: ENDING_DUR, flex: false });

  const fixed = raw.filter((r) => !r.flex).reduce((a, r) => a + r.sec, 0);
  const flex = raw.filter((r) => r.flex).reduce((a, r) => a + r.sec, 0);
  const k = flex > 0 ? Math.max(0.5, (TARGET_SECONDS - fixed) / flex) : 1;

  const items = raw.map(({ sec, flex: f, ...rest }) => ({ ...rest, frames: Math.round((f ? sec * k : sec) * FPS) }) as Item);
  // 반올림 오차는 엔딩에서 흡수
  const total = items.reduce((a, i) => a + i.frames, 0);
  items[items.length - 1].frames += TARGET_SECONDS * FPS - total;
  return items;
};

export const TIMELINE = build();
export const TOTAL_FRAMES = TIMELINE.reduce((a, i) => a + i.frames, 0);
