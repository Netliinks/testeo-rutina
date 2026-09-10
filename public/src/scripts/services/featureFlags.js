// GitLab feature flags (Unleash-compatible), same project used by the mobile app
const FEATURE_FLAGS_URL = window.APP_CONFIG?.featureFlagsUrl ?? '';
const FEATURE_FLAGS_CLIENT_KEY = window.APP_CONFIG?.featureFlagsClientKey ?? '';
const FEATURE_FLAGS_APP_NAME = window.APP_CONFIG?.featureFlagsAppName ?? 'production';

export const FEATURE_FLAG_FACE_MARCATIONS = 'face-marcations';

let cachedFeatures = null;

export const loadFeatureFlags = async () => {
    if (!FEATURE_FLAGS_URL) {
        cachedFeatures = null;
        return;
    }
    try {
        const res = await fetch(`${FEATURE_FLAGS_URL}/client/features`, {
            method: 'GET',
            headers: {
                'UNLEASH-APPNAME': FEATURE_FLAGS_APP_NAME,
                'UNLEASH-INSTANCEID': FEATURE_FLAGS_CLIENT_KEY,
                'Authorization': FEATURE_FLAGS_CLIENT_KEY,
            },
        });
        const data = await res.json();
        cachedFeatures = data.features ?? [];
    } catch (error) {
        console.error('Error loading feature flags', error);
        cachedFeatures = null;
    }
};

const matchesStrategy = (strategy) => {
    if (strategy.name === 'userWithId') {
        const currentUserId = localStorage.getItem('userId');
        const userIds = (strategy.parameters?.userIds ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);
        return currentUserId != null && userIds.includes(String(currentUserId));
    }
    // Unknown/default strategies (e.g. 'default') are treated as a match,
    // matching Unleash's own default rollout behavior.
    return true;
};

// Fails open (returns defaultValue) when the flag hasn't loaded yet or wasn't found,
// so a feature-flags outage never hides functionality that was already available.
// When a flag defines strategies (e.g. userWithId), it's only enabled for the
// current logged-in user if one of those strategies matches them.
export const isFeatureEnabled = (name, defaultValue = true) => {
    if (!cachedFeatures) {
        return defaultValue;
    }
    const flag = cachedFeatures.find((feature) => feature.name === name);
    if (!flag) {
        return defaultValue;
    }
    if (!flag.enabled) {
        return false;
    }
    if (!flag.strategies || flag.strategies.length === 0) {
        return true;
    }
    return flag.strategies.some(matchesStrategy);
};
