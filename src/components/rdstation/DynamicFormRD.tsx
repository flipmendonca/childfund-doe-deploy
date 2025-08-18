'use client'

import React, { useEffect, useRef } from 'react'

interface DynamicFormRDProps {
    form_id: string
    google_id?: string
    className?: string
}

declare global {
    interface Window {
        RDStationForms: any
    }
}

export function DynamicFormRD({
    form_id,
    google_id,
    className = ''
}: DynamicFormRDProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            !ref?.current?.querySelector('section') &&
            window.RDStationForms
        ) {
            try {
                new window.RDStationForms(`${form_id}`, `${google_id}`).createForm()
                console.log(`✅ [RD Station] Formulário criado: ${form_id}`)
            } catch (error) {
                console.error(`❌ [RD Station] Erro ao criar formulário ${form_id}:`, error)
            }
        }
    }, [form_id, google_id])

    return (
        <div className={`rd-form-container ${className}`}>
            <div
                ref={ref}
                className="rd-form-wrapper"
                role="main"
                id={form_id}
            />
        </div>
    )
}
