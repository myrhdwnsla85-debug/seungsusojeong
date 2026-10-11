import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Src } from "../storyboard";
import { C, F, FPS } from "../lib/theme";

/** 현재 장면 길이(초) — Sequence 안에서는 useVideoConfig가 전체 길이를 돌려주므로 따로 전달 */
export const SceneDur = React.createContext(10);
export const useSceneDur = () => React.useContext(SceneDur);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 0.61, 0.36, 1);

/** 장면 기준 시간(초) */
export const useT = () => useCurrentFrame() / FPS;

/** t초부터 d초 동안 0→1 */
export const useIn = (at: number, d = 0.9) => interpolate(useT(), [at, at + d], [0, 1], { ...clamp, easing: ease });

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.07'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23p)'/></svg>\")";

/** 청첩장과 같은 하늘색 종이 배경 */
export const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(130% 90% at 18% 0%, rgba(255,255,255,.30), transparent 55%), radial-gradient(120% 100% at 90% 100%, rgba(42,49,56,.12), transparent 60%), ${C.paper}`,
    }}
  />
);

export const Grain: React.FC = () => (
  <AbsoluteFill style={{ backgroundImage: grain, opacity: 0.9, pointerEvents: "none" }} />
);

/** 장면 시작/끝에 내용물을 부드럽게 페이드 */
export const SceneFade: React.FC<{ children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({
  children,
  fadeIn = 0.7,
  fadeOut = 0.7,
}) => {
  const end = useSceneDur();
  const t = useT();
  const opacity = interpolate(t, [0, fadeIn, end - fadeOut, end], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/** 사진 한 장 (천천히 확대되는 켄번스 + 흰 테두리). src가 placeholder면 자리 표시 */
export const Photo: React.FC<{
  src: Src;
  width: number;
  height: number;
  zoomFrom?: number;
  zoomTo?: number;
  border?: number;
  position?: string;
  style?: React.CSSProperties;
}> = ({ src, width, height, zoomFrom = 1.0, zoomTo = 1.07, border = 0, position = "50% 35%", style }) => {
  const scale = interpolate(useT(), [0, useSceneDur()], [zoomFrom, zoomTo], clamp);
  return (
    <div
      style={{
        width,
        height,
        padding: border,
        background: border ? "#F7F8F9" : undefined,
        boxShadow: "0 18px 40px rgba(42,49,56,.22), 0 2px 6px rgba(42,49,56,.12)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
        {typeof src === "string" ? (
          <Img
            src={staticFile(src)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: position, scale: String(scale) }}
          />
        ) : (
          <Placeholder label={src.placeholder} />
        )}
      </div>
    </div>
  );
};

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      background: `repeating-linear-gradient(135deg, ${C.card} 0 22px, #E3E9EE 22px 44px)`,
      border: `2px dashed ${C.sub}`,
      boxSizing: "border-box",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      textAlign: "center",
      padding: 24,
    }}
  >
    <div style={{ fontFamily: F.mono, fontSize: 22, letterSpacing: "0.4em", color: C.sub }}>PHOTO</div>
    <div style={{ fontFamily: F.ko, fontSize: 30, color: C.ink, lineHeight: 1.5 }}>{label}</div>
  </AbsoluteFill>
);

/** 한글 캡션 + 영문 소제목 */
export const Caption: React.FC<{
  text?: string;
  en?: string;
  at?: number;
  align?: "left" | "center" | "right";
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, en, at = 0.8, align = "center", size = 44, color = C.ink, style }) => {
  const p = useIn(at, 1.1);
  if (!text && !en) return null;
  return (
    <div style={{ textAlign: align, color, opacity: p, translate: `0 ${(1 - p) * 18}px`, ...style }}>
      {en ? (
        <div
          style={{
            fontFamily: F.en,
            fontStyle: "italic",
            fontSize: size * 0.62,
            letterSpacing: "0.14em",
            color: color === C.ink ? C.accent : color,
            marginBottom: 14,
          }}
        >
          {en}
        </div>
      ) : null}
      {text ? (
        <div style={{ fontFamily: F.ko, fontSize: size, lineHeight: 1.6, letterSpacing: "0.04em", whiteSpace: "pre-line" }}>
          {text}
        </div>
      ) : null}
    </div>
  );
};
