// PulseAI Fresh Clean Script

const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"; // Apni Groq API key (gsk_...) yahan paste karein
const MODEL_NAME = "llama-3.3-70b-versatile"; 

document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.querySelector(".message-input") || document.querySelector("input[type='text']");
    const sendBtn = document.querySelector(".send-btn") || document.querySelector("button.purple-btn") || document.querySelector("#send-btn");
    const chatContainer = document.querySelector(".chat-container") || document.querySelector(".messages") || document.querySelector("main");

    // Fix broken placeholder user avatar image dynamically
    const images = document.querySelectorAll("img");
    images.forEach(img => {
        if (img.src.includes("via.placeholder.com")) {
            img.src = "https://ui-avatars.com/api/?name=User&background=8a2be2&color=fff";
        }
    });

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;

        // Render User Message
        appendMessage(messageText, "user");
        chatInput.value = "";

        // Render Loading Message
        const loadingId = appendMessage("Thinking...", "bot");

        try {
            // Direct API Call to Groq (Fixes Vercel 404 Route Error)
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: "You are PulseAI, a helpful, precise, and polite AI assistant." },
                        { role: "user", content: messageText }
                    ],
                    model: MODEL_NAME
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `Error status: ${response.status}`);
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
        msgDiv.style.margin = "12px 0";
        msgDiv.style.padding = "10px 14px";
        msgDiv.style.borderRadius = "8px";
        msgDiv.style.maxWidth = "80%";
        
        if (sender === "user") {
            msgDiv.style.background = "linear-gradient(135deg, #8a2be2, #e91e63)";
            msgDiv.style.color = "#fff";
            msgDiv.style.marginLeft = "auto";
        } else {
            msgDiv.style.background = "#f0f0f0";
            msgDiv.style.color = "#222";
            msgDiv.style.marginRight = "auto";
        }

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

    if (sendBtn) sendBtn.addEventListener("click", sendMessage);
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});
