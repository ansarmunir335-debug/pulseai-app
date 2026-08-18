const chatBox = document.getElementById('chat-box');
const promptForm = document.getElementById('prompt-form');
const userInput = document.getElementById('user-input');

function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', className);
    
    const textSpan = document.createElement('span');
    textSpan.classList.add('message-text');
    textSpan.innerText = text;
    
    msgDiv.appendChild(textSpan);
    chatBox.appendChild(msgDiv);
    
    const welcome = document.querySelector('.welcome-container');
    if (welcome) welcome.style.display = 'none';

    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

function showLoadingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'bot-message', 'loading-msg');
    
    const dotsDiv = document.createElement('div');
    dotsDiv.classList.add('message-text', 'typing-dots');
    dotsDiv.innerHTML = '<span></span><span></span><span></span>';
    
    msgDiv.appendChild(dotsDiv);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

promptForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = userInput.value.trim();
    if (!prompt) return;

    appendMessage(prompt, 'user-message');
    userInput.value = '';

    const loadingIndicator = showLoadingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        loadingIndicator.remove();

        if (response.ok) {
            appendMessage(data.response, 'bot-message');
        } else {
            appendMessage('Error: ' + (data.error || 'Something went wrong'), 'bot-message');
        }
    } catch (err) {
        loadingIndicator.remove();
        appendMessage('Network Error: Please check your connection.', 'bot-message');
    }
});
