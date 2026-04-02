"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * MessageInput - Modern, auto-expanding text input for chat interfaces.
 * Uses a soft rounded design (2rem) and highlights on interaction.
 */
export function MessageInput({ 
  onSend, 
  disabled = false, 
  loading = false,
  placeholder,
  className 
}: MessageInputProps) {
  const t = useTranslations("Messaging");
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled || loading) return;
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "px-6 py-4 bg-background border-t border-border/40 flex items-center gap-4 transition-all duration-300",
      className
    )}>
      <div className="flex-1 relative group">
        <textarea 
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("type_message_placeholder") || "Tulis pesan..."}
          className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-4 outline-none transition-all resize-none scrollbar-none overflow-hidden text-[13px] leading-relaxed shadow-all-sm font-medium h-[64px]"
          rows={1}
          disabled={disabled || loading}
        />
      </div>
      <Button 
        onClick={handleSend}
        disabled={!value.trim() || disabled || loading}
        rounded="full"
        className="h-16 w-16 shrink-0 p-0 flex items-center justify-center shadow-lg shadow-primary/25 text-white transition-all bg-primary border-none hover:shadow-primary/40 hover:brightness-110 active:brightness-95 group"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <Send 
            size={24} 
            strokeWidth={2.5} 
            className="transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5" 
          />
        )}
      </Button>
    </div>
  );
}
