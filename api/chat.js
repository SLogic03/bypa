export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { sessionId, chatInput } = req.body;

    if (!chatInput || !chatInput.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'sendMessage',
                sessionId: sessionId || 'default',
                chatInput: chatInput,
            }),
        });

        // Escudo: si n8n responde con error (flujo apagado, etc.)
        if (!n8nResponse.ok) {
            console.error('n8n respondió con error. Código:', n8nResponse.status);
            return res.status(200).json({
                output: 'El asistente se encuentra en mantenimiento en este momento. Por favor, intenta de nuevo más tarde.',
            });
        }

        const data = await n8nResponse.json();
        return res.status(200).json(data);

    } catch (error) {
        // Si n8n se cae por completo y ni siquiera responde
        console.error('Error contactando a n8n:', error);
        return res.status(200).json({
            output: 'El asistente se encuentra en mantenimiento en este momento. Por favor, intenta de nuevo más tarde.',
        });
    }
}
