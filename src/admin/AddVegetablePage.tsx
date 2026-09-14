import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GardeningData, Vegetable } from "../types";
import { slugify } from "../lib/slug";
import styles from "./Admin.module.css";

const BLANK_VEGETABLE: Vegetable = {
    name: null,
    image: null,
    image_thumbnail: null,
    introduction: null,
    seed_and_growing_facts: {
        expected_germination_time: null,
        expected_germination_time_value: null,
        life_expectancy_of_stored_seed: null,
        life_expectancy_of_stored_seed_value: null,
        approximate_number_per_ounce: null,
    },
    soil_facts: null,
    sowing_and_planting: null,
    looking_after_the_crop: null,
    harvesting: null,
    in_the_kitchen: null,
    varieties: null,
    troubles: null,
    calendar: null,
    troubles_detail: null,
    yield: null,
    time_to_harvest: null,
    core_needs: null,
    metadata: {},
};
interface AddVegetablePageProps {
    data: GardeningData;
    onSave: (newData: GardeningData) => Promise<void>;
}

export function AddVegetablePage({ data, onSave }: AddVegetablePageProps) {
    const [vegName, setVegName] = useState("");
    const [introduction, setIntroduction] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = vegName.trim();
        if (!trimmed) {
            setError("Please enter a vegetable name.");
            return;
        }

        setIsSaving(true);
        setError("");
        try {
            const newKey = slugify(trimmed);
            if (data[newKey]) {
                setError(`A vegetable with key "${newKey}" already exists.`);
                return;
            }
            const newVeg: Vegetable = {
                ...BLANK_VEGETABLE,
                name: trimmed,
                introduction: introduction.trim() || null,
            };
            const updatedData: GardeningData = { ...data, [newKey]: newVeg };
            await onSave(updatedData);
            navigate(`/admin/vegetable/${newKey}`);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.adminPage}>
            <div className={styles.adminPageHeader}>
                <h1 className={styles.adminVegTitle}>Add New Vegetable</h1>
            </div>
            <div className={styles.addForm}>
                <form onSubmit={handleSubmit}>
                    <label className={styles.addLabel}>
                        Vegetable name *
                        <input
                            className={styles.addInput}
                            value={vegName}
                            onChange={(e) => setVegName(e.target.value)}
                            placeholder="e.g. Fennel"
                            autoFocus
                        />
                    </label>

                    <label className={styles.addLabel}>
                        Introduction (optional — can be added later)
                        <textarea
                            className={styles.fieldTextarea}
                            rows={5}
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                            placeholder="Brief description of the vegetable…"
                        />
                    </label>

                    {error && <p className={styles.saveError}>{error}</p>}

                    <div className={styles.editActions}>
                        <button
                            type="submit"
                            className={styles.saveSectionBtn}
                            disabled={isSaving || !vegName.trim()}
                        >
                            {isSaving ? "Creating…" : "+ Create vegetable"}
                        </button>
                        <button
                            type="button"
                            className={styles.cancelSectionBtn}
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
