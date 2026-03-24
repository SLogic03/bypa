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
                sessionId: sessionId || 'default',
                chatInput: chatInput,
            }),
        });

        const data = await n8nResponse.json();

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error contactando a n8n:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
