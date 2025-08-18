declare module 'embla-carousel-react' {
  export interface UseEmblaCarouselType {
    0: any;
    1: any;
    2: any;
  }
  
  export interface CarouselOptions {
    align?: string;
    loop?: boolean;
    axis?: string;
    [key: string]: any;
  }
  
  export function useEmblaCarousel(options?: CarouselOptions): UseEmblaCarouselType;
}

declare module 'input-otp' {
  export interface OTPInputContext {
    slots: any[];
  }
  
  export const OTPInputContext: React.Context<OTPInputContext>;
  export function OTPInput(props: any): JSX.Element;
  export function useOTPInput(): OTPInputContext;
}

declare module 'react-resizable-panels';

declare module 'recharts' {
  export interface LegendProps {
    payload?: any[];
    verticalAlign?: string;
  }
  
  export interface TooltipProps {
    payload?: any[];
    label?: string;
    active?: boolean;
    labelFormatter?: any;
    labelClassName?: string;
    formatter?: any;
  }
  
  export const Legend: React.ComponentType<LegendProps>;
  export const Tooltip: React.ComponentType<TooltipProps>;
  export const ResponsiveContainer: React.ComponentType<any>;
} 