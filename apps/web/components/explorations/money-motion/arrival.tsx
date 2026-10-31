import { moneyMotionStyles as styles } from "./motion-scope";

export function arrivalProps(arriving: boolean) {
  return arriving ? { className: styles.arriving, "data-arriving": "true" } : {};
}
