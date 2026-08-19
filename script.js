const GROQ_API_KEY = "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"; // Apni Groq Key (gsk_...) paste karein
const MODEL_NAME = "llama-3.3-70b-versatile";

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const chatContainer = document.getElementById("chat-container");

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        appendMessage(messageText, "user");
        chatInput.value = "";

        const loadingId = appendMessage("Thinking...", "bot");

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are PulseAI, a helpful AI assistant." },
                        { role: "user", content: messageText }
                    ],
                    model: MODEL_NAME
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Status: ${response.status}`);
            }

            const botReply = data.choices[0]?.message?.content || "No response received.";
            updateMessage(loadingId, botReply);

        } catch (error) {
            console.error("PulseAI API Error:", error);
            updateMessage(loadingId, `Error: ${error.message}`);
        }
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
});
