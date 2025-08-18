import { useRef, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaWrapperProps {
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

export interface RecaptchaWrapperRef {
  reset: () => void;
  execute: () => void;
}

const RecaptchaWrapper = forwardRef<RecaptchaWrapperRef, RecaptchaWrapperProps>(
  ({ onVerify, onExpired, onError, theme = 'light', size = 'normal', className }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      }
    }));

    if (!siteKey) {
      console.error('VITE_RECAPTCHA_SITE_KEY não encontrada nas variáveis de ambiente');
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> Chave do reCAPTCHA não encontrada. Verifique as variáveis de ambiente.
        </div>
      );
    }

    return (
      <div className={`flex justify-center ${className || ''}`}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onVerify}
          onExpired={onExpired}
          onError={onError}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

RecaptchaWrapper.displayName = 'RecaptchaWrapper';

export default RecaptchaWrapper; 