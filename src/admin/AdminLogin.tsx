import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "./adminApi";
import { useAdminAuth } from "./useAdminAuth";
import styles from "./Admin.module.css";

export function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const { setAuthed } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
            const ok = await verifyPassword(password);
            if (ok) {
                setAuthed(password);
                navigate("/admin/vegetable");
            } else {
                setError("Incorrect password.");
            }
        } catch {
            setError("Could not reach admin API. Is the dev server running?");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={styles.loginWrap}>
            <div className={styles.loginCard}>
                <div className={styles.loginLogo}>🌿</div>
                <h1 className={styles.loginTitle}>hackriculture-print Admin</h1>
                <p className={styles.loginHint}>
                    Enter the admin password to continue.
                </p>
                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    <input
                        type="password"
                        className={styles.loginInput}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    {error && <p className={styles.loginError}>{error}</p>}
                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={busy || !password}
                    >
                        {busy ? "Checking…" : "Log in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
