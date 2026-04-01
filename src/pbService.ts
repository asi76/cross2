/**
 * Cross2 API Service — PocketBase Direct
 * Server: http://pb.83.251.67.34.sslip.io/api
 * Authentication: disabled (public access)
 */

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://pb.83.251.67.34.sslip.io/api';

export let authUser: { id: string; email: string; displayName?: string } | null = {
    id: 'guest',
    email: 'guest@cross2.local',
    displayName: 'Guest'
};
export let authToken: string | null = 'guest-token';

function getHeaders() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    return h;
}

async function api(path: string, opts: RequestInit = {}) {
    const r = await fetch(`${PB_URL}${path}`, {
        ...opts,
        headers: { ...getHeaders(), ...(opts.headers as Record<string,string> || {}) }
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `API ${r.status}`);
    return d;
}

// ─── Auth (disabled - always logged in as guest) ──────────────────────────────

export const login = async (email: string, password: string) => {
    // No-op: always logged in
    return { user: authUser, token: authToken };
};

export const register = async (email: string, password: string) => login(email, password);
export const logout = () => { authToken = null; authUser = null; };
export const getUser = () => authUser;
export const isLoggedIn = () => true;

export const onAuthChange = (callback: (user: any) => void) => {
    callback(authUser);
};

// ─── Exercises ───────────────────────────────────────────────────────────────

export const fetchExercises = async () => {
    const d = await api('/collections/exercises/records');
    return d.items || [];
};

export const createExercise = async (data: any) => {
    return api('/collections/exercises/records', { method: 'POST', body: JSON.stringify(data) });
};

export const updateExercise = async (id: string, data: any) => {
    return api(`/collections/exercises/records/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

export const deleteExercise = async (id: string) => {
    return api(`/collections/exercises/records/${id}`, { method: 'DELETE' });
};

// ─── Exercise Groups ─────────────────────────────────────────────────────────

export const fetchExerciseGroups = async () => {
    const d = await api('/collections/exercise_groups/records');
    return d.items || [];
};

export const createExerciseGroup = async (data: any) => {
    return api('/collections/exercise_groups/records', { method: 'POST', body: JSON.stringify(data) });
};

export const deleteExerciseGroup = async (id: string) => {
    return api(`/collections/exercise_groups/records/${id}`, { method: 'DELETE' });
};

export const updateExerciseGroup = async (id: string, data: any) => {
    return api(`/collections/exercise_groups/records/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
};

// ─── Workouts ───────────────────────────────────────────────────────────────

export const fetchWorkouts = async () => {
    const d = await api('/collections/workouts/records');
    return d.items || [];
};

export const createWorkout = async (data: any) => {
    return api('/collections/workouts/records', { method: 'POST', body: JSON.stringify(data) });
};

export const updateWorkout = async (id: string, data: any) => {
    return api(`/collections/workouts/records/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteWorkout = async (id: string) => {
    return api(`/collections/workouts/records/${id}`, { method: 'DELETE' });
};

// ─── Workout Stations ──────────────────────────────────────────────────────

export const fetchStations = async (workoutId: string) => {
    const d = await api(`/collections/workout_stations/records?filter=workout_id="${workoutId}"`);
    return d.items || [];
};

export const createStation = async (data: any) => {
    return api('/collections/workout_stations/records', { method: 'POST', body: JSON.stringify(data) });
};

export const deleteStations = async (workoutId: string) => {
    const stations = await fetchStations(workoutId);
    for (const s of stations) {
        await deleteStationExercises(s.id);
        await api(`/collections/workout_stations/records/${s.id}`, { method: 'DELETE' });
    }
};

// ─── Station Exercises ─────────────────────────────────────────────────────

export const fetchStationExercises = async (stationId: string) => {
    const d = await api(`/collections/station_exercises/records?filter=station_id="${stationId}"`);
    return d.items || [];
};

export const createStationExercise = async (data: any) => {
    return api('/collections/station_exercises/records', { method: 'POST', body: JSON.stringify(data) });
};

export const deleteStationExercises = async (stationId: string) => {
    const exs = await fetchStationExercises(stationId);
    for (const e of exs) {
        await api(`/collections/station_exercises/records/${e.id}`, { method: 'DELETE' });
    }
};

// ─── GIF Mappings ──────────────────────────────────────────────────────────

export const getGifMappings = async () => {
    const d = await api('/collections/gif_mappings/records');
    return d.items || [];
};

export const setGifUrl = async (exerciseId: string, gifUrl: string) => {
    return api('/collections/gif_mappings/records', {
        method: 'POST',
        body: JSON.stringify({ exercise_id: exerciseId, gif_url: gifUrl })
    });
};

// ─── User Profiles ──────────────────────────────────────────────────────────

export const getProfile = async (userId: string) => {
    const d = await api('/collections/user_profiles/records');
    return (d.items || []).find((p: any) => p.user_id === userId) || null;
};

export const upsertProfile = async (userId: string, displayName: string, role = 'enabled') => {
    return api('/collections/user_profiles/records', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, display_name: displayName, role })
    });
};

export const fetchAllProfiles = async () => {
    const d = await api('/collections/user_profiles/records');
    return d.items || [];
};

export const updateProfileRole = async (id: string, role: string) => {
    return api(`/collections/user_profiles/records/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
    });
};

export const deleteProfile = async (id: string) => {
    return api(`/collections/user_profiles/records/${id}`, { method: 'DELETE' });
};
