/**
 * ─────────────────────────────────────────────────────────────
 *  식전 영상 스토리보드  —  이 파일만 고치면 영상이 바뀝니다.
 * ─────────────────────────────────────────────────────────────
 *  · 사진: public/photos 에 넣고 "photos/파일명.jpg" 로 지정
 *  · 아직 없는 사진은 ph("설명") 으로 두면 자리 표시 화면이 나옵니다
 *  · dur: 장면 길이(초). 생략 시 기본값 사용
 *  · 장(chapter)마다 단어찾기 격자에서 영어 단어를 찾으며 시작합니다
 */

export type Src = string | { placeholder: string };
export const ph = (placeholder: string): Src => ({ placeholder });

export type Shot =
  | { kind: "single"; photo: Src; text?: string; en?: string; dur?: number; side?: "left" | "right" }
  | { kind: "duo"; photos: [Src, Src]; text?: string; en?: string; dur?: number }
  | { kind: "trio"; photos: [Src, Src, Src]; text?: string; en?: string; dur?: number }
  | { kind: "full"; photo: Src; text?: string; en?: string; dur?: number }
  /** 격자 안에 사진 구멍이 뚫리고, 옆에서 단어가 찾아지는 장면 */
  | { kind: "gridcell"; photo: Src; word: string; text?: string; dur?: number }
  /** 사진 없이 문구만 */
  | { kind: "text"; text: string; en?: string; dur?: number };

export type Chapter = {
  /** 격자에서 찾을 대표 단어 (영문) */
  word: string;
  /** 같이 찾아지는 작은 단어들 */
  extra?: string[];
  no: string;
  title: string;
  en: string;
  shots: Shot[];
};

export const DEFAULT_DUR: Record<Shot["kind"], number> = {
  single: 7,
  duo: 8,
  trio: 9,
  full: 7,
  gridcell: 9,
  text: 6,
};
export const CHAPTER_TITLE_DUR = 9;
export const OPENING_DUR = 27;
export const ENDING_DUR = 36;

export const COUPLE = {
  groomEn: "SEUNGSU",
  brideEn: "SOJEONG",
  groom: "이승수",
  bride: "김소정",
  date: "2026. 10. 24. SAT",
  time: "PM 1:00",
  venue: "공군호텔 3층 그랜드볼룸홀",
};

const P = (n: string) => `photos/${n}.jpg`;

export const OPENING_SHOTS: Shot[] = [
  { kind: "duo", photos: [P("p06"), P("p19")], text: "저희 두 사람의 이야기를\n잠시 들려드릴게요", en: "our story" },
];

export const CHAPTERS: Chapter[] = [
  {
    word: "GROOM",
    extra: ["SEUNGSU", "BOY"],
    no: "01",
    title: "신랑 이승수",
    en: "The Groom",
    shots: [
      { kind: "trio", photos: [ph("신랑 아기 때"), ph("신랑 돌 사진"), ph("신랑 유치원")], text: "작고 귀여웠던 승수", en: "little seungsu" },
      { kind: "single", photo: ph("신랑 초등학생"), text: "개구쟁이 어린 시절", en: "childhood", side: "left" },
      { kind: "duo", photos: [ph("신랑 중·고등학생"), ph("신랑 졸업식")], text: "꿈 많던 학창 시절", en: "school days" },
      { kind: "single", photo: ph("신랑 대학·군 시절"), text: "청춘", en: "twenties", side: "right" },
      { kind: "full", photo: ph("신랑 최근 사진 (가로)"), text: "듬직한 어른이 되어", en: "growing up" },
      { kind: "single", photo: P("p03"), text: "신랑 이승수", en: "the groom", side: "left" },
      { kind: "gridcell", photo: P("p23"), word: "SEUNGSU", text: "소정이의 단 한 사람" },
    ],
  },
  {
    word: "BRIDE",
    extra: ["SOJEONG", "GIRL"],
    no: "02",
    title: "신부 김소정",
    en: "The Bride",
    shots: [
      { kind: "trio", photos: [ph("신부 아기 때"), ph("신부 돌 사진"), ph("신부 유치원")], text: "작고 사랑스러웠던 소정", en: "little sojeong" },
      { kind: "single", photo: ph("신부 초등학생"), text: "해맑던 어린 시절", en: "childhood", side: "right" },
      { kind: "duo", photos: [ph("신부 중·고등학생"), ph("신부 졸업식")], text: "꿈 많던 학창 시절", en: "school days" },
      { kind: "single", photo: ph("신부 대학 시절"), text: "청춘", en: "twenties", side: "left" },
      { kind: "full", photo: ph("신부 최근 사진 (가로)"), text: "아름다운 어른이 되어", en: "growing up" },
      { kind: "single", photo: P("p04"), text: "신부 김소정", en: "the bride", side: "right" },
      { kind: "gridcell", photo: P("p21"), word: "SOJEONG", text: "승수의 단 한 사람" },
    ],
  },
  {
    word: "HELLO",
    extra: ["FIRST", "MEET"],
    no: "03",
    title: "우리의 시작",
    en: "How We Met",
    shots: [
      { kind: "text", text: "20XX년 어느 날,\n우리는 처음 만났습니다", en: "the first day" },
      { kind: "single", photo: ph("처음 만났을 무렵"), text: "처음 만난 날", en: "hello", side: "left" },
      { kind: "duo", photos: [ph("첫 데이트"), ph("연애 초 사진")], text: "설레던 첫 데이트", en: "first date" },
      { kind: "trio", photos: [ph("연애 초 1"), ph("연애 초 2"), ph("연애 초 3")], text: "자꾸만 보고 싶던 날들", en: "falling in love" },
      { kind: "full", photo: ph("둘이 함께한 가로 사진"), text: "그렇게 우리가 되었습니다", en: "and then, us" },
    ],
  },
  {
    word: "LOVE",
    extra: ["DATE", "US"],
    no: "04",
    title: "함께한 계절들",
    en: "Our Seasons",
    shots: [
      { kind: "trio", photos: [ph("봄 데이트"), ph("벚꽃"), ph("봄 나들이")], text: "봄", en: "spring" },
      { kind: "duo", photos: [ph("여름 바다"), ph("여름 데이트")], text: "여름", en: "summer" },
      { kind: "trio", photos: [ph("가을 단풍"), ph("가을 산책"), ph("가을 데이트")], text: "가을", en: "autumn" },
      { kind: "duo", photos: [ph("겨울 눈"), ph("크리스마스")], text: "겨울", en: "winter" },
      { kind: "single", photo: ph("기념일"), text: "함께한 기념일", en: "anniversary", side: "right" },
      { kind: "full", photo: ph("일상 가로 사진"), text: "평범해서 더 소중한 하루", en: "everyday" },
      { kind: "gridcell", photo: ph("가장 좋아하는 둘 사진"), word: "TOGETHER", text: "언제나 함께" },
    ],
  },
  {
    word: "TRAVEL",
    extra: ["TRIP", "SKY"],
    no: "05",
    title: "함께 떠난 여행",
    en: "Our Journeys",
    shots: [
      { kind: "full", photo: ph("여행 풍경 (가로)"), text: "같은 곳을 바라보며", en: "same view" },
      { kind: "trio", photos: [ph("여행 1"), ph("여행 2"), ph("여행 3")], text: "낯선 곳에서의 우리", en: "somewhere new" },
      { kind: "duo", photos: [ph("여행 4"), ph("여행 5")], text: "잊지 못할 순간들", en: "moments" },
      { kind: "single", photo: ph("여행 6"), text: "어디든 너와 함께라면", en: "anywhere with you", side: "left" },
      { kind: "trio", photos: [ph("여행 7"), ph("여행 8"), ph("여행 9")], text: "그리고 다음 여행도, 함께", en: "next trip" },
    ],
  },
  {
    word: "PROMISE",
    extra: ["YES", "RING"],
    no: "06",
    title: "약속",
    en: "The Promise",
    shots: [
      { kind: "full", photo: P("p01"), text: "평생을 함께하자는 약속", en: "forever" },
      { kind: "duo", photos: [ph("프로포즈 1"), ph("프로포즈 2")], text: "\"나랑 결혼해줄래?\"", en: "will you marry me" },
      { kind: "single", photo: P("p07"), text: "\"응.\"", en: "yes", side: "right" },
      { kind: "duo", photos: [ph("상견례"), ph("양가 가족")], text: "두 가족이 하나가 되던 날", en: "family" },
    ],
  },
  {
    word: "FOREVER",
    extra: ["WEDO", "DAY"],
    no: "07",
    title: "그리고, 오늘",
    en: "We Do",
    shots: [
      { kind: "gridcell", photo: P("p09"), word: "WEDDING", text: "우리, 결혼합니다" },
      { kind: "duo", photos: [P("p13"), P("p14")], en: "you & me" },
      { kind: "single", photo: P("p10"), side: "left", text: "서로를 바라보는 일", en: "look at me" },
      { kind: "full", photo: P("p08") },
      { kind: "trio", photos: [P("p11"), P("p12"), P("p22")], en: "every moment" },
      { kind: "duo", photos: [P("p15"), P("p16")], text: "손을 맞잡고", en: "hand in hand" },
      { kind: "single", photo: P("p20"), side: "right", text: "늘 지금처럼 웃으며", en: "always" },
      { kind: "duo", photos: [P("p17"), P("p25")] },
      { kind: "gridcell", photo: P("p02"), word: "HELLO", text: "새로운 시작에 인사합니다" },
      { kind: "single", photo: P("p18"), side: "left", text: "오래도록 행복하겠습니다", en: "happily ever after" },
    ],
  },
];

export const ENDING = {
  photo: P("p06"),
  lines: ["귀한 걸음 해주셔서", "진심으로 감사드립니다"],
  soon: "잠시 후 예식이 시작됩니다",
};

export const shotDur = (s: Shot) => s.dur ?? DEFAULT_DUR[s.kind];
