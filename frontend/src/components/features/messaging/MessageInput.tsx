import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Box } from "@/components/ui/Box";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Stack } from "@/components/ui/Stack";
import { Textarea } from "@/components/ui/Textarea";

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
    <Box 
      paddingX="lg" 
      paddingY="md" 
      background="surface" 
      border="top" 
      display="flex" 
      align="center" 
      spacing="md"
      transition="all"
    >
      <Box flex="1" position="relative" shadow="sm" rounded="2xl" overflow="hidden">
        <Textarea 
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("type_message_placeholder") || "Tulis pesan..."}
          variant="minimal"
          disabled={disabled || loading}
        />
      </Box>
      <Button 
        onClick={handleSend}
        disabled={!value.trim() || disabled || loading}
        variant="primary"
        rounded="full"
        className="w-16 h-16 shrink-0 p-0 shadow-lg border-none flex items-center justify-center transition-all"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <IconWrapper icon="send" size="lg" isGhost />
        )}
      </Button>
    </Box>
  );
}
