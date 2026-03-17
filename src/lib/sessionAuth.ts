interface SessionLike {
    session_token?: string;
}

const SESSION_KEY = 'lumos_client_v2';

const parseSession = (raw: string | null): SessionLike | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as SessionLike;
    } catch {
        return null;
    }
};

export const getSessionToken = (): string => {
    const local = parseSession(localStorage.getItem(SESSION_KEY));
    if (local?.session_token) return local.session_token;

    const session = parseSession(sessionStorage.getItem(SESSION_KEY));
    if (session?.session_token) return session.session_token;

    return '';
};
