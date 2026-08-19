// PulseAI - Dynamic Model Groq Integration
const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"; // <-- Apni Groq API Key (gsk_...) yahan dalein

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatContainer = document.getElementById("chat-container");
    const modelSelect = document.getElementById("model-select");
    const newChatBtn = document.getElementById("new-chat-btn");

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // Selected Model uthayen
        let selectedModel = modelSelect ? modelSelect.value : "llama-3.3-70b-versatile";

        // User Message Display
        appendMessage(messageText, "user");
        chatInput.value = "";

        // Bot Loading Bubble
        const loadingId = appendMessage("Thinking...", "bot");

        try {
            let botReply = await callGroqAPI(messageText, selectedModel);
            updateMessage(loadingId, botReply);
        } catch (primaryError) {
            console.warn(`Primary Model (${selectedModel}) Failed:`, primaryError);

            // Fallback Logic: Agar selected model fail ho to fast backup model use karein
            const fallbackModel = "llama-3.1-8b-instant";
            if (selectedModel !== fallbackModel) {
                try {
                    updateMessage(loadingId, "Switching to backup engine...");
                    let fallbackReply = await callGroqAPI(messageText, fallbackModel);
                    updateMessage(loadingId, fallbackReply);
                    return;
                } catch (fallbackError) {
                    console.error("Fallback Model Error:", fallbackError);
                }
            }
            updateMessage(loadingId, `Error: ${primaryError.message}`);
        }
    }

    // Groq API Fetch Function
    async function callGroqAPI(promptText, modelName) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are PulseAI, a helpful AI assistant." },
                    { role: "user", content: promptText }
                ],
                model: modelName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `Status: ${response.status}`);
        }

        return data.choices[0]?.message?.content || "No response received.";
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        const msgId = "msg-" + Date.now();
        msgDiv.id = msgId;
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerText = text;

        if (chatContainer) {
            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        return msgId;
    }

    function updateMessage(msgId, newText) {
        const targetMsg = document.getElementById(msgId);
        if (targetMsg) {
            targetMsg.innerText = newText;
        }
    }

    // Event Listeners
    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener("click", () => {
            if (chatContainer) chatContainer.innerHTML = "";
        });
    }
});
