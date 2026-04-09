"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Send, Paperclip, FileText, X } from "lucide-react";

// UI Primitives
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { IconWrapper } from "@/components/ui/IconWrapper";

// Aesthetic Tier
import { 
  SystemSuccessToast
} from "./SystemAesthetics";
import { UploadDropzone } from "@/components/features/messaging/_components/MessagingAesthetics";

interface SystemComposeProps {
  submitting: boolean;
  onSendMessage: (formData: FormData) => Promise<boolean>;
}

/**
 * Level 3: Local Aesthetic Wrappers
 * Strictly isolating complex layout and one-off styling.
 */
const IconInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box position="relative">
    <Box 
      position="absolute" 
      zIndex="10" 
      opacity="40"
      className="left-3 top-1/2 -translate-y-1/2"
    >
      <IconWrapper icon="file-text" size="xs" isGhost />
    </Box>
    {children}
  </Box>
);

const ComposeTextarea = (props: any) => (
  <Textarea
    {...props}
    rounded="2xl"
    border="subtle"
    background="surface-soft"
    padding="md"
    className="flex-1 resize-none min-h-[220px]"
  />
);

const ComposeSubmitButton = ({ children, submitting }: { children: React.ReactNode, submitting: boolean }) => (
  <Button
    type="submit"
    disabled={submitting}
    rounded="xl"
    size="lg"
    variant="primary"
    fullWidth
    className="py-5"
  >
    {children}
  </Button>
);

const InfoFooter = ({ translations: t }: { translations: any }) => (
  <Stack spacing="none" opacity="40">
    <Inline spacing="xs" justify="center" align="center">
      <IconWrapper icon="shield" size="xs" isGhost />
      <Text variant="caption" color="muted">Informasi Layanan</Text>
    </Inline>
    <Box paddingX="lg">
      <Text variant="caption" weight="medium" color="muted" textAlign="center">
        {t("info_footer") || "Gunakan fitur ini untuk komunikasi formal terkait teknis platform."}
      </Text>
    </Box>
  </Stack>
);

export function SystemCompose({ submitting, onSendMessage }: SystemComposeProps) {
  const t = useTranslations("SystemHub");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sentSuccess, setSentSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    const success = await onSendMessage(formData);
    if (success) {
      setTitle("");
      setBody("");
      setAttachments([]);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 5000);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  return (
    <WorkspacePanelContent padding="lg" flex="1" overflow="hidden">
      <form onSubmit={handleSubmit} className="h-full">
        <Stack spacing="lg" height="full">
          {/* 1. Main 2-Column Grid */}
          <Box display="flex" direction="row" spacing="xl" width="full" flex="1">
            {/* Left Column: Metadata & Attachments */}
            <Box flex="1" width="full" display="flex" direction="col" gap="lg" minWidth="0">
              <Stack spacing="sm">
                <Text variant="subheading">
                  Judul Masalah
                </Text>
                <IconInputWrapper>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kendala Login..." 
                    rounded="xl" 
                    className="pl-10 bg-background"
                    required
                  />
                </IconInputWrapper>
              </Stack>

              <Stack spacing="sm" flex="1">
                <Text variant="subheading">
                  Lampiran (Opsional)
                </Text>
                <Label asChild>
                  <Box flex="1" cursor="pointer">
                    <UploadDropzone 
                      border="dashed"
                      className="h-full flex flex-col items-center justify-center"
                    >
                      <Box marginBottom="xs" opacity="40">
                        <IconWrapper icon="paperclip" isGhost size="sm" />
                      </Box>
                      <Text variant="subheading" color="black" textAlign="center">
                        {attachments.length > 0 
                          ? t("files_selected", { count: attachments.length }) 
                          : "Klik Pilih File"}
                      </Text>
                      <Input 
                        type="file" 
                        multiple 
                        isHidden 
                        ref={fileInputRef}
                        onChange={handleFileChange} 
                      />
                    </UploadDropzone>
                  </Box>
                </Label>
              </Stack>
            </Box>

            {/* Right Column: Content & Submission */}
            <Box flex="1" width="full" display="flex" direction="col" gap="lg" minWidth="0">
              <Stack spacing="sm" flex="1">
                <Text variant="subheading">
                  Detail Masalah / Saran
                </Text>
                <ComposeTextarea
                  value={body}
                  onChange={(e: any) => setBody(e.target.value)}
                  placeholder="Jelaskan kendala Anda secara rinci..."
                  required
                />
              </Stack>

              <Stack spacing="sm" marginTop="auto">
                <ComposeSubmitButton submitting={submitting}>
                  <Inline spacing="sm" justify="center" align="center" width="full">
                    <IconWrapper icon="send" size="xs" color="white" isGhost />
                    <Text variant="subheading" color="white">
                      {submitting ? t("sending") : "Kirim Bantuan"}
                    </Text>
                  </Inline>
                </ComposeSubmitButton>

                <InfoFooter translations={t} />
              </Stack>
            </Box>
          </Box>

          {sentSuccess && (
            <SystemSuccessToast>
              {t("success_msg")}
            </SystemSuccessToast>
          )}
        </Stack>
      </form>
    </WorkspacePanelContent>
  );
}
