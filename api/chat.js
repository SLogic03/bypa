// Rate limiting simple: máximo de peticiones por IP
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;       // máx. peticiones
const RATE_LIMIT_WINDOW = 60000; // por cada 60 segundos
const MAX_MESSAGE_LENGTH = 500;  // caracteres máximos por mensaje

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(ip, { start: now, count: 1 });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        return true;
    }
    return false;
}

export default async function handler(req, res) {
    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // Validar origen: dominios desde variable de entorno + Vercel previews + localhost
    const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
    ];
    const allowedOrigins = [...envOrigins, ...defaultOrigins];

    const origin = req.headers.origin || req.headers.referer || '';
    const isSameOrigin = !origin; // Same-origin requests often have no Origin header
    const isVercelPreview = origin.includes('.vercel.app');
    const isAllowed = isSameOrigin || isVercelPreview || allowedOrigins.some(o => origin.startsWith(o));

    if (!isAllowed) {
        return res.status(403).json({ error: 'Origen no autorizado' });
    }

    // Rate limiting por IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
        return res.status(200).json({
            output: 'Has enviado demasiados mensajes. Por favor, espera un momento antes de intentar de nuevo.',
        });
    }

    const { sessionId, chatInput } = req.body;

    // Validar que el mensaje exista y no sea demasiado largo
    if (!chatInput || !chatInput.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    if (chatInput.length > MAX_MESSAGE_LENGTH) {
        return res.status(200).json({
            output: `Tu mensaje es demasiado largo. Por favor, escribe un mensaje de máximo ${MAX_MESSAGE_LENGTH} caracteres.`,
        });
    }

    try {
        const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'sendMessage',
                sessionId: sessionId || 'default',
                chatInput: chatInput.trim(),
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
