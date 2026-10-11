import { COLS, ROWS } from "./theme";

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export type Dir = "h" | "v" | "d";
export const DIRS: Record<Dir, [number, number]> = { h: [0, 1], v: [1, 0], d: [1, 1] };

export type Rect = { r: number; c: number; h: number; w: number };
export const inRect = (r: number, c: number, x: Rect) =>
  r >= x.r && r < x.r + x.h && c >= x.c && c < x.c + x.w;

export type WordSpec = {
  text: string;
  /** 시작 셀. 생략하면 자동 배치 */
  r?: number;
  c?: number;
  dir?: Dir;
  /** 하이라이트가 그려지기 시작하는 시점(초, 장면 기준) */
  at: number;
  /** 하이라이트가 그려지는 시간(초) */
  dur?: number;
};

export type PlacedWord = Required<Omit<WordSpec, "dur">> & { dur: number };

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type GridData = {
  letters: string[][];
  delays: number[][]; // 0..1 등장 순서
  words: PlacedWord[];
  owner: number[][][]; // 해당 셀을 지나는 단어 인덱스들
};

export const buildGrid = (seed: number, specs: WordSpec[], blocked: Rect[]): GridData => {
  const rand = rng(seed);
  const letters = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ALPHA[Math.floor(rand() * 26)]),
  );
  const delays = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => rand()));
  const fixed = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false));
  const owner: number[][][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => [] as number[]),
  );

  const fits = (t: string, r: number, c: number, d: Dir) => {
    const [dr, dc] = DIRS[d];
    for (let i = 0; i < t.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      if (rr < 0 || cc < 0 || rr >= ROWS || cc >= COLS) return false;
      if (blocked.some((b) => inRect(rr, cc, b))) return false;
      if (fixed[rr][cc] && letters[rr][cc] !== t[i]) return false;
    }
    return true;
  };

  const words: PlacedWord[] = specs.map((s, wi) => {
    const t = s.text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let r = s.r;
    let c = s.c;
    let dir: Dir = s.dir ?? "h";
    if (r === undefined || c === undefined) {
      const dirs: Dir[] = s.dir ? [s.dir] : ["h", "v", "d"];
      for (let k = 0; k < 2000; k++) {
        const d = dirs[Math.floor(rand() * dirs.length)];
        const rr = Math.floor(rand() * ROWS);
        const cc = Math.floor(rand() * COLS);
        if (fits(t, rr, cc, d)) {
          r = rr;
          c = cc;
          dir = d;
          break;
        }
      }
      if (r === undefined || c === undefined) throw new Error(`단어를 배치할 수 없음: ${t}`);
    }
    const [dr, dc] = DIRS[dir];
    for (let i = 0; i < t.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      letters[rr][cc] = t[i];
      fixed[rr][cc] = true;
      owner[rr][cc].push(wi);
    }
    return { text: t, r, c, dir, at: s.at, dur: s.dur ?? Math.max(0.8, t.length * 0.18) };
  });

  return { letters, delays, words, owner };
};
