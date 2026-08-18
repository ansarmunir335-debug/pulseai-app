document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prompt-form');
    const input = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendBtn = document.getElementById('send-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt) return;

        appendMessage(prompt, 'user-message');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        const loadingDiv = appendMessage('Thinking...', 'bot-message');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch response');
            }

            // Fixed Response Extraction: Har tarah ke format se response nikalega
            const botReply = data.result || data.text || data.response || data.choices?.[0]?.message?.content || 'No response';
            loadingDiv.textContent = botReply;

        } catch (error) {
            loadingDiv.textContent = `Error: ${error.message}`;
            loadingDiv.classList.add('error-message');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', className);
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return msgDiv;
    }
});
