export interface ConversionPayload {
    conversion_identifier: string
    email: string
    cf_valor?: string
    cf_utm_source?: string
    cf_utm_medium?: string
    cf_utm_campaign?: string
    cf_utm_content?: string
    cf_utm_referrer?: string
    cf_utm_term?: string
    traffic_value?: string
    traffic_source?: string
    traffic_medium?: string
    traffic_campaign?: string
    traffic_content?: string
    traffic_referrer?: string
    traffic_term?: string
    name?: string
    mobile_phone?: string
    state?: string
    city?: string
    // Campos customizados para análise de formulários
    cf_form_type?: string
    cf_step_number?: string
    cf_total_steps?: string
    cf_child_id?: string
    cf_step_name?: string
}

export const sendEventConversionRD = async (
    conversion_identifier: string,
    email: string,
    customFields: Partial<ConversionPayload> = {}
): Promise<Response> => {
    try {
        // 🔧 CORREÇÃO: Usar URL dinâmica baseada no ambiente
        const baseUrl = typeof window !== 'undefined' 
            ? window.location.origin 
            : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        console.log('🌐 [RD Station] Enviando para:', `${baseUrl}/api/rdstation/conversion`);
        
        const payload: ConversionPayload = {
            conversion_identifier,
            email,
            ...customFields
        };

        return await fetch(`${baseUrl}/api/rdstation/conversion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
    } catch (error) {
        console.error('Erro ao enviar evento de conversão para RD Station:', error);
        throw error; // Re-throw the error after logging
    }
}

// Função com retry automático
export const sendEventConversionRDWithRetry = async (
    identifier: string,
    email: string,
    others: Partial<ConversionPayload> = {},
    retries: number = 3
): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await sendEventConversionRD(identifier, email, others)
            if (response.ok) {
                return response
            }
        } catch (error) {
            console.warn(`Tentativa ${i + 1} falhou:`, error)
            if (i === retries - 1) throw error
            // Aguarda antes de tentar novamente (backoff exponencial)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
        }
    }
    throw new Error(`Falha após ${retries} tentativas`)
}
