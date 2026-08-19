// Baked-in default backend address for the installed native (Android) app,
// which runs standalone on a phone and has no same-origin server to talk to.
// Filled in once the backend is deployed publicly; until then the app falls
// back to asking the user for an address on first launch.
export const DEFAULT_SERVER_URL = 'https://expense-tracker-esam.onrender.com';
