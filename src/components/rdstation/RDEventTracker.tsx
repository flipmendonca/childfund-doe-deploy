'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { sendEventConversionRD } from '@/utils/rdstation/conversion'
import { useUTMParams } from '@/hooks/useUTMParams'

interface RDEventTrackerProps {
    type: string
    email?: string
    name?: string
    phone?: string
    state?: string
    city?: string
    value?: string
    onEventSent?: () => void
}

export function RDEventTracker({
    type,
    email,
    name,
    phone,
    state,
    city,
    value,
    onEventSent
}: RDEventTrackerProps) {
    const path = usePathname()
    const { allParams } = useUTMParams()

    useEffect(() => {
        if (email && email !== 'undefined') {
            const sendEvent = async () => {
                try {
                    await sendEventConversionRD(type, email, {
                        cf_valor: value,
                        cf_utm_medium: allParams.utm_medium,
                        cf_utm_source: allParams.utm_source,
                        cf_utm_campaign: allParams.utm_campaign,
                        cf_utm_content: allParams.utm_content,
                        cf_utm_referrer: allParams.utm_referrer,
                        cf_utm_term: allParams.utm_term,
                        traffic_value: path,
                        traffic_source: allParams.traffic_source,
                        traffic_medium: allParams.traffic_medium,
                        traffic_campaign: allParams.traffic_campaign,
                        traffic_content: allParams.traffic_content,
                        traffic_referrer: allParams.traffic_referrer,
                        traffic_term: allParams.traffic_term,
                        name,
                        mobile_phone: phone,
                        state,
                        city,
                    })
                    
                    console.log(`✅ [RD Station] Evento enviado: ${type}`)
                    onEventSent?.()
                } catch (error) {
                    console.error(`❌ [RD Station] Erro ao enviar evento ${type}:`, error)
                }
            }

            sendEvent()
        }
    }, [type, email, name, phone, state, city, value, path, allParams, onEventSent])

    return null // Componente não renderiza nada visualmente
}
