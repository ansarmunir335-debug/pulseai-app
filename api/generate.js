export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight Request Check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API Key Check
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is missing in Vercel environment variables.' });
  }

  // Input Extract & Sanitize
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }

  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: `You are PulseAI, a highly intelligent, empathetic, and exceptionally polite AI assistant.

Core Rules & Guidelines:
1. Exact Language & Script Matching: Detect the language, dialect, and alphabet script used by the user. Always reply in the EXACT same language and script. If the user writes Urdu words in Latin/English alphabets (Roman Urdu/Hindi), reply strictly in Roman Urdu/Hindi. If they use native Urdu script (اردو), reply in native Urdu.
2. Emotional Intelligence & Calm Tone: Maintain a kind, respectful, and encouraging tone at all times.
3. Conflict De-escalation: If the user is angry, rude, or frustrated, stay humble, patient, and polite. Gently validate their concerns and help calm them down without argument.
4. Direct & Helpful: Focus on providing practical, high-quality solutions.`
          },
          {
            role: 'user',
            content: prompt.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || 'Groq API returned an error.' 
      });
    }

    const aiMessage = data.choices?.[0]?.message?.content || 'No response generated.';

    // Multiple key fallback for Frontend Compatibility
    return res.status(200).json({
      text: aiMessage,
      response: aiMessage,
      content: aiMessage,
      reply: aiMessage,
      raw: data
    });

  } catch (err) {
    return res.status(500).json({ 
      error: 'Internal Server Error: ' + (err.message || 'Unknown network error') 
    });
  }
}
