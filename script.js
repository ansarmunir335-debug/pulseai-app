// PulseAI - Fixed Alignment & Clean Loader Script
const GROQ_API_KEY = "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"; // <-- Apni Groq API Key yahan paste karein

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatContainer = document.getElementById("chat-container");
    const modelSelect = document.getElementById("model-select");
    const newChatBtn = document.getElementById("new-chat-btn");

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // 1. User Message Display (Right Aligned)
        appendMessage(messageText, "user");
        chatInput.value = "";

        // 2. AI Temporary "Thinking..." Bubble (Left Aligned)
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "message bot-message thinking-bubble";
        loadingDiv.innerText = "Thinking...";
        chatContainer.appendChild(loadingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        let selectedModel = modelSelect ? modelSelect.value : "llama-3.1-8b-instant";

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are PulseAI, a helpful assistant. Reply in Roman Urdu or English as requested." },
                        { role: "user", content: messageText }
                    ],
                    model: selectedModel
                })
            });

            const data = await response.json();

            // 3. Delete "Thinking..." Bubble completely
            loadingDiv.remove();

            if (!response.ok) {
                throw new Error(data.error?.message || `Status: ${response.status}`);
            }

            // 4. Display AI Response below User message
            const botReply = data.choices[0]?.message?.content || "No response received.";
            appendMessage(botReply, "bot");

        } catch (error) {
            console.error("PulseAI API Error:", error);
            // Remove loader and show clean error message
            loadingDiv.remove();
            appendMessage(`Error: ${error.message}`, "bot");
        }
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerText = text;

        if (chatContainer) {
            chatContainer.appendChild(msgDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Event Listeners
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);

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
