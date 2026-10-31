export const moneyMotion = {
  duration: {
    fade: 150,
    arrive: 240,
    tick: 280,
    confirm: 320,
    roll: 360,
    hold: 1600,
  },
  stagger: 60,
  ease: {
    enter: "cubic-bezier(0, 0, .2, 1)",
    exit: "cubic-bezier(.4, 0, 1, 1)",
    standard: "cubic-bezier(.4, 0, .2, 1)",
    settle: "cubic-bezier(.2, 0, 0, 1)",
  },
  travel: 4,
} as const;

export type MoneyMotionMode = "system" | "reduce";
