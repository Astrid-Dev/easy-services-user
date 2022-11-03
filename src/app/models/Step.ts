/* eslint-disable @typescript-eslint/naming-convention */
export interface StepQuestion{
  key: string;
  type: string;
  label: string;
  label_en: string;
  answer_label?: string;
  answer_label_en?: string;
  placeholder?: string;
  required?: boolean;
  minlength?: number;
  maxlength?: number;
  options?: {
    label: string;
    label_en: string;
    value: string;
  }[];
}

export interface StepAnswer{
  label: string;
  label_en: string;
  value?: string;
  value_en?: string;
  values?: {
    value: string;
    value_en: string;
    unique_value: string;
  }[];
  is_array?: boolean;
}
