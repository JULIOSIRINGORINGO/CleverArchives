"use client";

import { useApi } from "./useApi";

export interface BookFieldConfig {
  id: number;
  name: string;
  label: string;
  field_type: "text" | "number" | "textarea" | "dropdown";
  required: boolean;
  active: boolean;
  position: number;
  options?: { id: number; value: string }[];
}

export function useBookFormConfig() {
  const { data: config, isLoading, isError: error, mutate: refresh } = useApi("/book_form_configs");

  return { 
    config: config || [], 
    loading: isLoading, 
    error: error ? "Failed to load form configuration" : null, 
    refresh 
  };
}
