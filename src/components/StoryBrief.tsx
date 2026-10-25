/** The same four questions at the top of every big-change story, each linked to the section that answers it. */
import styles from "./StoryBrief.module.css";

const QUESTIONS = ["What is it?", "How likely is it?", "What would it mean?", "What can be done?"];

/** answers: [text, anchor] in the order of QUESTIONS. */
export default function StoryBrief({ answers }: { answers: [string, string][] }) {
  return (
    <dl className={styles.brief}>
      {answers.map(([a, href], i) => (
        <div key={QUESTIONS[i]}>
          <dt><a href={href}>{QUESTIONS[i]}</a></dt>
          <dd>{a}</dd>
        </div>
      ))}
    </dl>
  );
}
