import { useUnits } from "../lib/units";
import styles from "./UnitToggle.module.css";
import type { UnitSystem } from "../lib/measure";

const OPTIONS: { value: UnitSystem; label: string }[] = [
    { value: "imperial", label: "in/lb" },
    { value: "metric", label: "cm/kg" },
];

/** Imperial ⇄ metric switch for the public app (also flows into PDF downloads). */
export default function UnitToggle() {
    const { system, setSystem } = useUnits();
    return (
        <div
            className={styles.toggle}
            role="group"
            aria-label="Measurement units"
        >
            {OPTIONS.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    className={system === o.value ? styles.active : styles.btn}
                    aria-pressed={system === o.value}
                    onClick={() => setSystem(o.value)}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
