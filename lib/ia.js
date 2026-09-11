// Llamadas a los proveedores de IA desde el servidor. Usa fetch global (Node 18+).

async function callGemini(archivos, systemPrompt, userText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Falta GEMINI_API_KEY en el servidor.');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const parts = [];
  archivos.forEach(a => parts.push({ inlineData: { mimeType: 'application/pdf', data: a.base64 } }));
  parts.push({ text: userText });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
    })
  });
  if (!resp.ok) {
    let d = `HTTP ${resp.status}`;
    try { const e = await resp.json(); d = (e.error && e.error.message) || d; } catch {}
    if (resp.status === 404) d = `Modelo "${model}" no encontrado (404). Ajusta GEMINI_MODEL.`;
    else if (resp.status === 429) d = 'Límite de la capa gratuita de Gemini (429). Reintenta en ~1 min.';
    throw new Error(d);
  }
  const data = await resp.json();
  const cand = (data.candidates || [])[0];
  if (!cand) {
    const b = data.promptFeedback && data.promptFeedback.blockReason;
    throw new Error(b ? `Gemini bloqueó la solicitud (${b}).` : 'Gemini no devolvió resultados.');
  }
  const texto = ((cand.content && cand.content.parts) || []).map(p => p.text || '').join('');
  return { texto, truncado: cand.finishReason === 'MAX_TOKENS' };
}

async function callAnthropic(archivos, systemPrompt, userText) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta ANTHROPIC_API_KEY en el servidor.');
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  const content = [];
  archivos.forEach(a => content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: a.base64 } }));
  content.push({ type: 'text', text: userText });
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 4000, system: systemPrompt, messages: [{ role: 'user', content }] })
  });
  if (!resp.ok) {
    let d = `HTTP ${resp.status}`;
    try { const e = await resp.json(); d = (e.error && e.error.message) || d; } catch {}
    throw new Error(d);
  }
  const data = await resp.json();
  return { texto: (data.content || []).map(c => c.text || '').join(''), truncado: data.stop_reason === 'max_tokens' };
}

async function analizar(archivos, systemPrompt, userText) {
  const provider = (process.env.IA_PROVIDER || 'gemini').toLowerCase();
  return provider === 'anthropic'
    ? callAnthropic(archivos, systemPrompt, userText)
    : callGemini(archivos, systemPrompt, userText);
}

module.exports = { callGemini, callAnthropic, analizar };
