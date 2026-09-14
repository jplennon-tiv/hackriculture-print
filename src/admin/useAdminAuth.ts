import { useCallback } from "react";

const SESSION_KEY = "gardenAdmin";

export function useAdminAuth() {
    const isAuthed = (): boolean =>
        sessionStorage.getItem(SESSION_KEY) !== null;

    const getPassword = (): string => sessionStorage.getItem(SESSION_KEY) ?? "";

    const setAuthed = useCallback((password: string) => {
        sessionStorage.setItem(SESSION_KEY, password);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(SESSION_KEY);
    }, []);

    return { isAuthed, getPassword, setAuthed, logout };
}
