// LocalStorage helpers
export function getStoredData(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
}

export function setStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

export const defaultSettings = {
    soundEnabled: false,
    musicEnabled: false,
    animationsEnabled: true,
    autoSaveEnabled: true,
    difficultyLevel: 'normal'
};

export function getSettings() {
    return getStoredData('gameSettings', defaultSettings);
}
