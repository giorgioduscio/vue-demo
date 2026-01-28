export interface FormField {
  type: string;
  key: string;
  label: string;
  value: string | number | boolean;
  placeholder?: string;
  message?: string;
  options?:{ label: string, value: string | number }[]

  asterisk?: boolean;
  validation?: (value: any) => boolean;
  errorMessage?: string;
}