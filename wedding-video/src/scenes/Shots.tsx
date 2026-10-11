import React, { useMemo } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Caption, clamp, ease, Photo, useIn, useT } from "../components/common";
import { WordGrid } from "../components/WordGrid";
import { Rect, WordSpec } from "../lib/grid";
import { C, CELL, COLS, F, H, W } from "../lib/theme";
import { Shot } from "../storyboard";

/** 사진 장면 뒤에 깔리는 옅은 알파벳 격자 */
const FaintGrid: React.FC<{ seed: number; holes?: Rect[] }> = ({ seed, holes }) => (
  <WordGrid seed={seed} base={0.13} appearDur={0} holes={holes} />
);

/** 아래에서 살짝 올라오며 나타나는 래퍼 */
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const p = useIn(at, 1.2);
  return <div style={{ opacity: p, translate: `0 ${(1 - p) * 30}px`, ...style }}>{children}</div>;
};

export const ShotScene: React.FC<{ shot: Shot; seed: number }> = ({ shot, seed }) => {
  switch (shot.kind) {
    case "single":
      return <Single shot={shot} seed={seed} />;
    case "duo":
    case "trio":
      return <Multi shot={shot} seed={seed} />;
    case "full":
      return <Full shot={shot} />;
    case "gridcell":
      return <GridCell shot={shot} seed={seed} />;
    case "text":
      return <TextCard shot={shot} seed={seed} />;
  }
};

const Single: React.FC<{ shot: Extract<Shot, { kind: "single" }>; seed: number }> = ({ shot, seed }) => {
  const left = (shot.side ?? "left") === "left";
  const pw = 600;
  const ph = 860;
  const px = left ? 300 : W - 300 - pw;
  return (
    <AbsoluteFill>
      <FaintGrid seed={seed} />
      <Rise at={0.1} style={{ position: "absolute", left: px, top: (H - ph) / 2 }}>
        <Photo src={shot.photo} width={pw} height={ph} border={14} />
      </Rise>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: left ? px + pw : 0,
          right: left ? 0 : W - px,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Caption text={shot.text} en={shot.en} at={1.0} size={52} />
      </div>
    </AbsoluteFill>
  );
};

const Multi: React.FC<{ shot: Extract<Shot, { kind: "duo" | "trio" }>; seed: number }> = ({ shot, seed }) => {
  const n = shot.photos.length;
  const pw = n === 2 ? 500 : 420;
  const ph = n === 2 ? 720 : 610;
  const gap = n === 2 ? 56 : 48;
  const hasCaption = !!(shot.text || shot.en);
  const top = hasCaption ? (n === 2 ? 90 : 120) : (H - ph) / 2;
  const total = n * pw + (n - 1) * gap;
  const lines = (shot.text ?? "").split("\n").length;
  return (
    <AbsoluteFill>
      <FaintGrid seed={seed} />
      {shot.photos.map((p, i) => (
        <Rise key={i} at={0.1 + i * 0.35} style={{ position: "absolute", left: (W - total) / 2 + i * (pw + gap), top }}>
          <Photo src={p} width={pw} height={ph} border={12} zoomTo={1.06 + i * 0.01} />
        </Rise>
      ))}
      {hasCaption ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: top + ph + (n === 2 ? 34 : 50) }}>
          <Caption text={shot.text} en={shot.en} at={0.6 + n * 0.35} size={lines > 1 ? 36 : 44} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Full: React.FC<{ shot: Extract<Shot, { kind: "full" }> }> = ({ shot }) => {
  const hasCaption = !!(shot.text || shot.en);
  return (
    <AbsoluteFill>
      <Photo src={shot.photo} width={W} height={H} zoomFrom={1.02} zoomTo={1.1} style={{ boxShadow: "none" }} position="50% 45%" />
      {hasCaption ? (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(20deg, rgba(20,26,32,.55) 0%, rgba(20,26,32,0) 45%)" }} />
          <div style={{ position: "absolute", left: 120, bottom: 110 }}>
            <Caption text={shot.text} en={shot.en} at={1.0} align="left" size={50} color="#F4F6F8" />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// 사진 자리: 10 x 15 셀 (600 x 900), 화면 중앙 / 그 아래 캡션 자리
const GC_PHOTO: Rect = { r: 1, c: 11, w: 10, h: 15 };
const GC_CAP: Rect = { r: 16, c: 6, w: 20, h: 2 };
const GC_HOLES = [{ ...GC_PHOTO, at: 0.2 }, { ...GC_CAP, at: 0.2 }];

const GridCell: React.FC<{ shot: Extract<Shot, { kind: "gridcell" }>; seed: number }> = ({ shot, seed }) => {
  const photo = GC_PHOTO;
  const cap = GC_CAP;
  const holes = GC_HOLES;
  const words: WordSpec[] = useMemo(() => [{ text: shot.word, at: 1.6, dur: 1.4 }], [shot.word]);
  const p = useIn(0.9, 1.2);
  return (
    <AbsoluteFill>
      <WordGrid seed={seed} base={0.5} appearDur={0} holes={holes} words={words} dimTo={0.28} />
      <div
        style={{
          position: "absolute",
          left: photo.c * CELL + 6,
          top: photo.r * CELL + 6,
          opacity: p,
          scale: String(interpolate(p, [0, 1], [0.97, 1])),
        }}
      >
        <Photo src={shot.photo} width={photo.w * CELL - 12} height={photo.h * CELL - 12} border={0} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: cap.r * CELL + 2 }}>
        <Caption text={shot.text} at={2.6} size={38} />
      </div>
    </AbsoluteFill>
  );
};

const TEXT_HOLES = [{ r: 5, c: 5, w: COLS - 10, h: 8, at: 0 }];

const TextCard: React.FC<{ shot: Extract<Shot, { kind: "text" }>; seed: number }> = ({ shot, seed }) => {
  const holes = TEXT_HOLES;
  return (
    <AbsoluteFill>
      <WordGrid seed={seed} base={0.32} appearDur={0} holes={holes} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Caption text={shot.text} en={shot.en} at={0.9} size={54} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TITLE_HOLE: Rect & { at: number } = { r: 8, c: 6, w: COLS - 12, h: 6, at: 3.4 };
const TITLE_HOLES = [TITLE_HOLE];

/** 장 제목: 격자에서 단어를 찾고, 아래 구멍에 한글 제목 */
export const ChapterTitle: React.FC<{ word: string; extra: string[]; no: string; title: string; en: string; seed: number }> = ({
  word,
  extra,
  no,
  title,
  en,
  seed,
}) => {
  const t = useT();
  const len = word.length;
  const hole = TITLE_HOLE;
  const words: WordSpec[] = useMemo(
    () => [
      { text: word, r: 5, c: Math.floor((COLS - len) / 2), dir: "h", at: 1.6, dur: 1.4 },
      ...extra.map((e, i) => ({ text: e, at: 3.0 + i * 0.5, dur: 0.9 })),
    ],
    [word, extra, len],
  );
  const holes = TITLE_HOLES;
  return (
    <AbsoluteFill>
      <WordGrid seed={seed} words={words} holes={holes} base={0.6} appearAt={0} appearDur={1.2} dimTo={0.3} />
      <div
        style={{
          position: "absolute",
          left: hole.c * CELL,
          width: hole.w * CELL,
          top: hole.r * CELL,
          height: hole.h * CELL,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 24,
            letterSpacing: "0.5em",
            color: C.accent,
            opacity: interpolate(t, [3.8, 4.6], [0, 1], { ...clamp, easing: ease }),
          }}
        >
          CHAPTER {no}
        </div>
        <Caption text={title} en={en} at={4.2} size={76} />
      </div>
    </AbsoluteFill>
  );
};
