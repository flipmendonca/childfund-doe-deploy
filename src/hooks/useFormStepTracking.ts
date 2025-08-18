import { useEffect, useRef } from 'react'
import { sendEventConversionRD } from '@/utils/rdstation/conversion'
import { useUTMParams } from './useUTMParams'

interface FormStepTrackingOptions {
  formType: 'donation_recurrent' | 'donation_single' | 'sponsorship' | 'registration' | 'login' | 'profile_update'
  currentStep: number
  totalSteps: number
  stepName: string
  userEmail?: string
  userName?: string
  userPhone?: string
  userState?: string
  userCity?: string
  value?: string
  childId?: string
  onStepTracked?: (step: number) => void
}

export const useFormStepTracking = ({
  formType,
  currentStep,
  totalSteps,
  stepName,
  userEmail,
  userName,
  userPhone,
  userState,
  userCity,
  value,
  childId,
  onStepTracked
}: FormStepTrackingOptions) => {
  const { allParams } = useUTMParams()
  const trackedSteps = useRef<Set<number>>(new Set())

  useEffect(() => {
    // Só rastrear se temos email e se a etapa ainda não foi rastreada
    if (userEmail && userEmail !== 'undefined' && !trackedSteps.current.has(currentStep)) {
      const trackStep = async () => {
        try {
          const eventIdentifier = `${stepName} - Etapa ${currentStep}/${totalSteps}`
          
          await sendEventConversionRD(eventIdentifier, userEmail, {
            cf_valor: value,
            cf_utm_medium: allParams.utm_medium,
            cf_utm_source: allParams.utm_source,
            cf_utm_campaign: allParams.utm_campaign,
            cf_utm_content: allParams.utm_content,
            cf_utm_referrer: allParams.utm_referrer,
            cf_utm_term: allParams.utm_term,
            traffic_value: window.location.pathname,
            traffic_source: allParams.traffic_source,
            traffic_medium: allParams.traffic_medium,
            traffic_campaign: allParams.traffic_campaign,
            traffic_content: allParams.traffic_content,
            traffic_referrer: allParams.traffic_referrer,
            traffic_term: allParams.traffic_term,
            name: userName,
            mobile_phone: userPhone,
            state: userState,
            city: userCity,
            // Campos customizados para análise
            cf_form_type: formType,
            cf_step_number: currentStep.toString(),
            cf_total_steps: totalSteps.toString(),
            cf_child_id: childId,
            cf_step_name: stepName
          })
          
          console.log(`✅ [RD Station] Etapa ${currentStep} rastreada: ${stepName}`)
          trackedSteps.current.add(currentStep)
          onStepTracked?.(currentStep)
        } catch (error) {
          console.error(`❌ [RD Station] Erro ao rastrear etapa ${currentStep}:`, error)
        }
      }

      trackStep()
    }
  }, [
    currentStep,
    totalSteps,
    stepName,
    userEmail,
    userName,
    userPhone,
    userState,
    userCity,
    value,
    childId,
    formType,
    allParams,
    onStepTracked
  ])

  // Função para rastrear conclusão do formulário
  const trackFormCompletion = async () => {
    if (!userEmail || userEmail === 'undefined') return

    try {
      const completionEvent = getCompletionEvent(formType)
      
      await sendEventConversionRD(completionEvent, userEmail, {
        cf_valor: value,
        cf_utm_medium: allParams.utm_medium,
        cf_utm_source: allParams.utm_source,
        cf_utm_campaign: allParams.utm_campaign,
        cf_utm_content: allParams.utm_content,
        cf_utm_referrer: allParams.utm_referrer,
        cf_utm_term: allParams.utm_term,
        traffic_value: window.location.pathname,
        traffic_source: allParams.traffic_source,
        traffic_medium: allParams.traffic_medium,
        traffic_campaign: allParams.traffic_campaign,
        traffic_content: allParams.traffic_content,
        traffic_referrer: allParams.traffic_referrer,
        traffic_term: allParams.traffic_term,
        name: userName,
        mobile_phone: userPhone,
        state: userState,
        city: userCity,
        cf_form_type: formType,
        cf_child_id: childId
      })
      
      console.log(`✅ [RD Station] Formulário concluído: ${completionEvent}`)
    } catch (error) {
      console.error(`❌ [RD Station] Erro ao rastrear conclusão:`, error)
    }
  }

  return {
    trackFormCompletion,
    isStepTracked: (step: number) => trackedSteps.current.has(step)
  }
}

// Função para mapear tipos de formulário para eventos de conclusão
const getCompletionEvent = (formType: string): string => {
  switch (formType) {
    case 'donation_recurrent':
      return 'Doação Recorrente'
    case 'donation_single':
      return 'Doação Única'
    case 'sponsorship':
      return 'Apadrinhamento'
    case 'registration':
      return 'Usuário Cadastrado'
    case 'login':
      return 'Usuário Logado'
    case 'profile_update':
      return 'Perfil Atualizado'
    default:
      return 'Formulário Concluído'
  }
}
