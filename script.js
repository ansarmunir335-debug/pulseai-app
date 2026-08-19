// Supabase Configuration
const SUPABASE_URL = "https://szxignrsvxfrijulaolp.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_88fhAVReBj4sWIcT79U02Q_pPCmZYLe";
const GROQ_API_KEY = "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";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    // Auth Elements
    const authOverlay = document.getElementById("auth-overlay");
    const appContainer = document.getElementById("app-container");
    const authForm = document.getElementById("auth-form");
    const authEmail = document.getElementById("auth-email");
    const authPassword = document.getElementById("auth-password");
    const authTitle = document.getElementById("auth-title");
    const authSubmitBtn = document.getElementById("auth-submit-btn");
    const authToggleLink = document.getElementById("auth-toggle-link");
    const authError = document.getElementById("auth-error");
    const userEmailDisplay = document.getElementById("user-email-display");
    const userAvatar = document.getElementById("user-avatar");
    const logoutBtn = document.getElementById("logout-btn");

    let isSignUpMode = false;

    // Toggle Login / SignUp View
    authToggleLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        authTitle.innerText = isSignUpMode ? "Create Account" : "Welcome to PulseAI";
        authSubmitBtn.innerText = isSignUpMode ? "Sign Up" : "Sign In";
        authToggleLink.innerText = isSignUpMode ? "Sign In" : "Sign Up";
        authError.innerText = "";
    });

    // Handle Form Submit (SignUp / LogIn)
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        authError.innerText = "";
        const email = authEmail.value.trim();
        const password = authPassword.value.trim();

        if (isSignUpMode) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) authError.innerText = error.message;
            else alert("Account created! Check email for verification link if enabled.");
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) authError.innerText = error.message;
        }
    });

    // Check Active Auth Session
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            authOverlay.style.display = "none";
            appContainer.style.display = "flex";
            userEmailDisplay.innerText = session.user.email;
            userAvatar.innerText = session.user.email.charAt(0).toUpperCase();
        } else {
            authOverlay.style.display = "flex";
            appContainer.style.display = "none";
        }
    });

    // Logout
    logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
    });
});
