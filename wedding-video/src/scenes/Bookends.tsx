import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Caption, clamp, ease, Photo, useIn, useSceneDur, useT } from "../components/common";
import { WordGrid } from "../components/WordGrid";
import { Rect, WordSpec } from "../lib/grid";
import { C, CELL, F } from "../lib/theme";
import { COUPLE, ENDING } from "../storyboard";

const box = (r: Rect): React.CSSProperties => ({
  position: "absolute",
  left: r.c * CELL,
  top: r.r * CELL,
  width: r.w * CELL,
  height: r.h * CELL,
});

/* ───────── 오프닝 ─────────
 * SEUNGSU(가로)와 SOJEONG(세로)이 S에서 만나고, 그 E를 지나는 WEDO.
 */
const O_WORDS: WordSpec[] = [
  { text: COUPLE.groomEn, r: 4, c: 3, dir: "h", at: 2.6, dur: 1.4 },
  { text: COUPLE.brideEn, r: 4, c: 8, dir: "v", at: 4.6, dur: 1.4 },
  { text: "WEDO", r: 7, c: 7, dir: "h", at: 6.6, dur: 1.0 },
];
const O_PHOTO: Rect = { r: 1, c: 17, w: 11, h: 16 };
const O_TEXT: Rect = { r: 12, c: 1, w: 14, h: 5 };
const O_HOLES = [
  { ...O_PHOTO, at: 8.2 },
  { ...O_TEXT, at: 10.2 },
];
export const OPENING_PHOTO = "photos/p17.jpg";

export const Opening: React.FC = () => {
  const photo = useIn(9.0, 1.6);
  const t = useT();
  return (
    <AbsoluteFill>
      <WordGrid seed={2026} words={O_WORDS} holes={O_HOLES} base={0.6} appearAt={0.3} appearDur={1.8} dimTo={0.3} />
      <div style={{ ...box(O_PHOTO), padding: 6, boxSizing: "border-box", opacity: photo }}>
        <Photo src={OPENING_PHOTO} width={O_PHOTO.w * CELL - 12} height={O_PHOTO.h * CELL - 12} zoomTo={1.12} />
      </div>
      <div style={{ ...box(O_TEXT), display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Caption text={`${COUPLE.groom}  ·  ${COUPLE.bride}`} en="we're getting married" at={11.0} size={54} />
        <div
          style={{
            marginTop: 18,
            fontFamily: F.en,
            fontSize: 30,
            letterSpacing: "0.2em",
            color: C.sub,
            opacity: interpolate(t, [12.4, 13.6], [0, 1], { ...clamp, easing: ease }),
          }}
        >
          {COUPLE.date} · {COUPLE.time}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────── 엔딩 ───────── */
const E_PHOTO: Rect = { r: 2, c: 3, w: 10, h: 14 };
const E_TEXT: Rect = { r: 5, c: 15, w: 15, h: 10 };
const E_WORDS: WordSpec[] = [
  { text: "THANKYOU", r: 3, c: 18, dir: "h", at: 1.8, dur: 1.4 },
  { text: "LOVE", at: 3.4, dur: 0.8 },
  { text: "FAMILY", at: 3.9, dur: 0.9 },
  { text: "FRIENDS", at: 4.4, dur: 0.9 },
];
const E_HOLES = [
  { ...E_PHOTO, at: 5.2 },
  { ...E_TEXT, at: 6.0 },
];

export const Ending: React.FC = () => {
  const dur = useSceneDur();
  const t = useT();
  const photo = useIn(6.0, 1.6);
  const soon = interpolate(t, [dur - 14, dur - 12.5], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      <WordGrid seed={1024} words={E_WORDS} holes={E_HOLES} base={0.6} appearAt={0} appearDur={1.4} dimTo={0.28} />
      <div style={{ ...box(E_PHOTO), padding: 6, boxSizing: "border-box", opacity: photo }}>
        <Photo src={ENDING.photo} width={E_PHOTO.w * CELL - 12} height={E_PHOTO.h * CELL - 12} zoomTo={1.1} />
      </div>
      <div style={{ ...box(E_TEXT), display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 30 }}>
        <Caption text={ENDING.lines.join("\n")} en="thank you" at={7.0} size={52} />
        <div
          style={{
            fontFamily: F.hand,
            fontSize: 64,
            color: C.ink,
            rotate: "-3deg",
            marginTop: 10,
            opacity: interpolate(t, [9.5, 11], [0, 1], { ...clamp, easing: ease }),
          }}
        >
          We do.
        </div>
        <div style={{ opacity: soon, translate: `0 ${(1 - soon) * 14}px`, textAlign: "center" }}>
          <div style={{ fontFamily: F.ko, fontSize: 34, color: C.ink, letterSpacing: "0.08em" }}>{ENDING.soon}</div>
          <div style={{ marginTop: 12, fontFamily: F.en, fontSize: 26, letterSpacing: "0.2em", color: C.sub }}>
            {COUPLE.date} · {COUPLE.venue}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
