import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { buildGrid, DIRS, inRect, Rect, WordSpec } from "../lib/grid";
import { C, CELL, F, FPS } from "../lib/theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.22, 0.61, 0.36, 1);

export type WordGridProps = {
  seed: number;
  words?: WordSpec[];
  /** 글자를 지우고 비워둘 영역 (사진·문구 자리) */
  holes?: (Rect & { at?: number })[];
  /** 글자 기본 농도 */
  base?: number;
  /** 글자들이 나타나기 시작/완료되는 시점(초). appearDur=0이면 처음부터 보임 */
  appearAt?: number;
  appearDur?: number;
  /** 첫 단어를 찾은 뒤 나머지 글자를 이 농도로 흐리게 */
  dimTo?: number;
};

export const WordGrid: React.FC<WordGridProps> = ({
  seed,
  words = [],
  holes = [],
  base = 0.55,
  appearAt = 0,
  appearDur = 1.6,
  dimTo,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const grid = useMemo(() => buildGrid(seed, words, holes), [seed, words, holes]);

  const firstFound = grid.words.length ? Math.min(...grid.words.map((w) => w.at + w.dur)) : Infinity;
  const dim =
    dimTo === undefined
      ? 1
      : interpolate(t, [firstFound, firstFound + 1], [1, dimTo / base], { ...clamp, easing: ease });

  const cells: React.ReactNode[] = [];
  grid.letters.forEach((row, r) =>
    row.forEach((ch, c) => {
      const hole = holes.find((h) => inRect(r, c, h));
      const appear =
        appearDur === 0
          ? 1
          : interpolate(t, [appearAt + grid.delays[r][c] * appearDur, appearAt + grid.delays[r][c] * appearDur + 0.4], [0, 1], clamp);
      let op = appear * base * dim;
      if (hole) {
        // 구멍: 지정 시점부터 무작위 순서로 글자가 사라짐
        const at = hole.at ?? -10;
        op *= interpolate(t, [at + grid.delays[r][c] * 0.8, at + grid.delays[r][c] * 0.8 + 0.25], [1, 0], clamp);
        if (op <= 0.001) return;
      }
      // 이 글자를 지나는 단어 중 하이라이트가 도달한 것이 있는가
      let found = 0;
      for (const wi of grid.owner[r][c]) {
        const w = grid.words[wi];
        const [dr, dc] = DIRS[w.dir];
        const idx = dr ? (r - w.r) / dr : (c - w.c) / dc;
        const reach = w.at + (w.dur * (idx + 0.5)) / w.text.length;
        found = Math.max(found, interpolate(t, [reach, reach + 0.25], [0, 1], clamp));
      }
      cells.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            left: c * CELL,
            top: r * CELL,
            width: CELL,
            height: CELL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: F.mono,
            fontSize: 30,
            fontWeight: found > 0.5 ? 500 : 400,
            color: C.ink,
            opacity: op + (appear - op) * found,
          }}
        >
          {ch}
        </div>,
      );
    }),
  );

  return (
    <AbsoluteFill>
      {grid.words.map((w, i) => {
        const [dr, dc] = DIRS[w.dir];
        const step = CELL * Math.hypot(dr, dc);
        const full = (w.text.length - 1) * step + CELL * 0.82;
        const p = interpolate(t, [w.at, w.at + w.dur], [0, 1], { ...clamp, easing: ease });
        if (p <= 0) return null;
        const angle = (Math.atan2(dr, dc) * 180) / Math.PI;
        const thick = CELL * 0.78;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: w.c * CELL + CELL / 2 - thick / 2,
              top: w.r * CELL + CELL / 2 - thick / 2,
              width: thick + (full - thick) * p,
              height: thick,
              borderRadius: thick / 2,
              border: `2.5px solid ${C.ink}`,
              background: C.highlight,
              transformOrigin: `${thick / 2}px ${thick / 2}px`,
              rotate: `${angle}deg`,
              opacity: interpolate(p, [0, 0.08], [0, 1], clamp),
            }}
          />
        );
      })}
      {cells}
    </AbsoluteFill>
  );
};
