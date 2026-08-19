// ==========================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ==========================================
const SUPABASE_URL = "https://szxignrsvxfrijulaolp.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_88fhAVReBj4sWIcT79U02Q_pPCmZYLe"; 
const GROQ_API_KEY = "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";

// Initialize Supabase SDK
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentChatId = null;
let chats = JSON.parse(localStorage.getItem('pulseai_chats')) || [];

// ==========================================
// 2. AUTHENTICATION LOGIC
// ==========================================

// Auth State Listener
supabase.auth.onAuthStateChange((event, session) => {
  const authOverlay = document.getElementById("auth-overlay");
  const appContainer = document.getElementById("app-container");

  if (session) {
    authOverlay.style.display = "none";
    appContainer.style.display = "flex";
    initApp();
  } else {
    authOverlay.style.display = "flex";
    appContainer.style.display = "none";
  }
});

// Switch Tab UI
function switchTab(tabName) {
  const signInForm = document.getElementById("signin-form");
  const signUpForm = document.getElementById("signup-form");
  const tabSignIn = document.getElementById("tab-signin");
  const tabSignUp = document.getElementById("tab-signup");

  if (tabName === 'signup') {
    signInForm.style.display = "none";
    signUpForm.style.display = "flex";
    tabSignIn.classList.remove("active");
    tabSignUp.classList.add("active");
  } else {
    signUpForm.style.display = "none";
    signInForm.style.display = "flex";
    tabSignUp.classList.remove("active");
    tabSignIn.classList.add("active");
  }
}

// Sign In Event Listener
document.getElementById("signin-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;
  const btn = document.getElementById("btn-signin");

  btn.innerText = "Signing in...";
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Login Error: " + error.message);
    btn.innerText = "Sign In";
  }
});

// Sign Up Event Listener
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const btn = document.getElementById("btn-signup");

  btn.innerText = "Creating Account...";
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("Signup Error: " + error.message);
    btn.innerText = "Create Account";
  } else {
    alert("Account created! Please Sign In.");
    switchTab('signin');
    btn.innerText = "Create Account";
  }
});

// Logout
async function handleLogout() {
  await supabase.auth.signOut();
}

// ==========================================
// 3. CHAT APP ENGINE
// ==========================================

function initApp() {
  renderSidebarHistory();
  if (chats.length > 0) {
    loadChat(chats[0].id);
  } else {
    createNewChat();
  }
}

function createNewChat() {
  currentChatId = Date.now().toString();
  const newChat = {
    id: currentChatId,
    title: "New Conversation",
    messages: []
  };
  chats.unshift(newChat);
  saveChatsToStorage();
  renderSidebarHistory();
  renderChatBox();
}

function saveChatsToStorage() {
  localStorage.setItem('pulseai_chats', JSON.stringify(chats));
}

function renderSidebarHistory() {
  const historyContainer = document.getElementById("chat-history-list");
  historyContainer.innerHTML = "";

  chats.forEach(chat => {
    const item = document.createElement("div");
    item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
    item.innerText = chat.title;
    item.onclick = () => loadChat(chat.id);
    historyContainer.appendChild(item);
  });
}

function loadChat(chatId) {
  currentChatId = chatId;
  renderSidebarHistory();
  renderChatBox();
}

function renderChatBox() {
  const chatBox = document.getElementById("chat-box");
  const activeChat = chats.find(c => c.id === currentChatId);

  chatBox.innerHTML = "";

  if (!activeChat || activeChat.messages.length === 0) {
    chatBox.innerHTML = `
      <div id="welcome-screen" class="welcome-screen">
        <div class="welcome-logo">✨</div>
        <h2>How can PulseAI help you today?</h2>
        <p>Select a model, type your prompt, and start generating insights.</p>
      </div>`;
    return;
  }

  activeChat.messages.forEach(msg => {
    appendMessageToUI(msg.role, msg.content);
  });
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessageToUI(role, content) {
  const chatBox = document.getElementById("chat-box");
  const welcomeScreen = document.getElementById("welcome-screen");
  
  if (welcomeScreen) welcomeScreen.remove();

  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerHTML = `<div class="message-content">${escapeHTML(content)}</div>`;
  
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

// Utility to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================
// 4. GROQ API HANDLER
// ==========================================

async function handleChatSubmit(event) {
  event.preventDefault();
  
  const inputEl = document.getElementById("user-input");
  const modelSelect = document.getElementById("model-select");
  const prompt = inputEl.value.trim();
  const selectedModel = modelSelect.value;

  if (!prompt) return;

  // 1. Render User Message
  inputEl.value = "";
  appendMessageToUI("user", prompt);

  // 2. Store User Message
  const activeChat = chats.find(c => c.id === currentChatId);
  if (activeChat) {
    if (activeChat.messages.length === 0) {
      activeChat.title = prompt.substring(0, 24) + "...";
    }
    activeChat.messages.push({ role: "user", content: prompt });
    saveChatsToStorage();
    renderSidebarHistory();
  }

  // 3. Render Placeholder Loading Indicator
  const thinkingUI = appendMessageToUI("assistant", "Thinking...");

  try {
    // 4. Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: activeChat.messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error.message);

    const botReply = data.choices[0].message.content;

    // 5. Update UI & Persistent State
    thinkingUI.querySelector(".message-content").innerText = botReply;
    activeChat.messages.push({ role: "assistant", content: botReply });
    saveChatsToStorage();

  } catch (err) {
    thinkingUI.querySelector(".message-content").innerText = "Error: " + err.message;
  }
}
