import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

export interface UTMParams {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_referrer?: string
    utm_term?: string
}

export interface TrafficParams {
    traffic_source?: string
    traffic_medium?: string
    traffic_campaign?: string
    traffic_content?: string
    traffic_referrer?: string
    traffic_term?: string
}

export const useUTMParams = () => {
    const [searchParams] = useSearchParams()

    const utmParams = useMemo(() => {
        const source = searchParams.get('utm_source')
        const medium = searchParams.get('utm_medium')
        const campaign = searchParams.get('utm_campaign')
        const content = searchParams.get('utm_content')
        const referrer = searchParams.get('utm_referrer')
        const term = searchParams.get('utm_term')

        return {
            utm_source: source || 'Desconhecido',
            utm_medium: medium || 'Desconhecido',
            utm_campaign: campaign || 'Desconhecido',
            utm_content: content || 'Desconhecido',
            utm_referrer: referrer || 'Desconhecido',
            utm_term: term || 'Desconhecido',
        }
    }, [searchParams])

    const trafficParams = useMemo(() => {
        const source = searchParams.get('utm_source')
        const medium = searchParams.get('utm_medium')
        const campaign = searchParams.get('utm_campaign')
        const content = searchParams.get('utm_content')
        const referrer = searchParams.get('utm_referrer')
        const term = searchParams.get('utm_term')

        return {
            traffic_source: source || 'Desconhecido',
            traffic_medium: medium || 'Desconhecido',
            traffic_campaign: campaign || 'Desconhecido',
            traffic_content: content || 'Desconhecido',
            traffic_referrer: referrer || 'Desconhecido',
            traffic_term: term || 'Desconhecido',
        }
    }, [searchParams])

    const allParams = useMemo(() => ({
        ...utmParams,
        ...trafficParams,
    }), [utmParams, trafficParams])

    return {
        utmParams,
        trafficParams,
        allParams,
    }
}
