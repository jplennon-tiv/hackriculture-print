import { usePaper, type PaperSize } from "../lib/paper";
import styles from "./UnitToggle.module.css";

const OPTIONS: { value: PaperSize; label: string }[] = [
    { value: "A6", label: "A6" },
    { value: "A5", label: "A5" },
    { value: "A4", label: "A4" },
];

/** Paper-size switch for the public app (flows into PDF single + batch prints). */
export default function PaperToggle() {
    const { paper, setPaper } = usePaper();
    return (
        <div className={styles.toggle} role="group" aria-label="Paper size">
            {OPTIONS.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    className={paper === o.value ? styles.active : styles.btn}
                    aria-pressed={paper === o.value}
                    onClick={() => setPaper(o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
