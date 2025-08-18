'use client'

import Script from 'next/script'

export function RDTrackingScript() {
    return (
        <Script
            async
            src="https://d335luupugsy2.cloudfront.net/js/loader-scripts/0276997e-a282-4568-aecb-f5494b1c18ad-loader.js"
            strategy="afterInteractive"
        />
    )
}

export function RDFormsScript() {
    return (
        <Script 
            src="https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js"
            strategy="afterInteractive"
        />
    )
}

export function RDStationScripts() {
    return (
        <>
            <RDTrackingScript />
            <RDFormsScript />
        </>
    )
}
