"use client";

import React, { useState, useEffect } from "react";
import { Box } from "@/components/ui/Box";
import { Stack } from "@/components/ui/Stack";
import { Inline } from "@/components/ui/Inline";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { IconWrapper } from "@/components/ui/IconWrapper";
import { Form } from "@/components/ui/Form";
import { Label } from "@/components/ui/Label";
import { WorkspacePanelHeader, WorkspacePanelContent } from "@/components/ui/WorkspacePanel";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";
import { PillGroup, PillItem, SearchResultsOverlay, UploadDropzone, AvatarIcon, ListRow, SearchInputBox } from "./_components/MessagingAesthetics";

interface ComposeViewProps {
  currentUser: any;
  translations: any;
  onSuccess: () => void;
  toast: (msg: string, type: "success" | "error") => void;
}

export function ComposeView({
  currentUser,
  translations: t,
  onSuccess,
  toast
}: ComposeViewProps) {
  const isMember = currentUser?.role?.name === 'member';
  const [recipientType, setRecipientType] = useState(isMember ? "specific" : "all");
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (userSearchQuery.length < 2) {
        setUserSearchResults([]);
        return;
      }
      try {
        const res = await apiService.users.search(userSearchQuery);
        setUserSearchResults(res.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) return;
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", t("new_message_subject") || "Pesan Baru"); 
    formData.append("body", body);
    formData.append("recipient_type", recipientType);
    if (recipientType === 'specific' && recipientId) {
      formData.append("recipient_id", recipientId.toString());
    }
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      await apiService.messages.create(formData);
      setBody("");
      setRecipientType(isMember ? "specific" : "all");
      setRecipientId(null);
      setUserSearchQuery("");
      setAttachments([]);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      toast(t("send_error"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box variant="fill-remaining" background="white" rounded="3xl" border="subtle" shadow="sm">
      <WorkspacePanelHeader 
        showDivider={true} 
        paddingX="lg" 
        paddingY="md" 
        background="white" 
        display="flex" 
        align="center" 
        shrink="0"
        border="bottom"
      >
        <Inline spacing="md" align="center">
          <AvatarIcon background="primary" color="white">
            <IconWrapper icon="plus" size="sm" isGhost color="white" />
          </AvatarIcon>
          <Text variant="heading" weight="bold" color="black">
            {t("compose_title")}
          </Text>
        </Inline>
      </WorkspacePanelHeader>

      <WorkspacePanelContent padding="lg" flex="1" overflow="hidden" className="min-h-0">
        <Form 
          onSubmit={handleSend} 
          flex="1" 
          display="flex" 
          direction="col"
          height="full"
        >
          <Box width="full" flex="1" display="flex" direction="col" minHeight="0">
              <Box 
                display="grid" 
                gridCols="1" 
                mdGridCols="2" 
                spacing="lg" 
                align="stretch" 
                flex="1" 
                minHeight="0"
                height="full"
              >
                <Stack spacing="md" flex="1">
                  <Stack spacing="xs">
                    <Text variant="subheading" weight="medium" color="black">
                      {t("recipient_type")}
                    </Text>
                    <PillGroup className={isMember ? "grid-cols-1" : "grid-cols-2"}>
                      {!isMember && (
                        <PillItem 
                          active={recipientType === 'all'}
                          onClick={() => { setRecipientType('all'); setRecipientId(null); }}
                        >
                          <Text variant="label-strong">{t("recipient_member")}</Text>
                        </PillItem>
                      )}
                      <PillItem 
                        active={recipientType === 'specific'}
                        onClick={() => setRecipientType('specific')} 
                      >
                        <Text variant="label-strong">{t("recipient_individual")}</Text>
                      </PillItem>
                    </PillGroup>
                  </Stack>

                  {recipientType === 'specific' && (
                    <Stack spacing="xs" position="relative">
                      <Text variant="subheading" weight="medium" color="black">
                        {t("search_contacts")}
                      </Text>
                      <SearchInputBox>
                        <IconWrapper icon="search" size="xs" isGhost />
                        <Input 
                          type="text" 
                          value={userSearchQuery} 
                          onChange={(e) => setUserSearchQuery(e.target.value)} 
                          placeholder={t("search_contacts")} 
                          rounded="xl"
                          className="pl-10"
                        />
                      </SearchInputBox>
                      <AnimatePresence>
                        {userSearchResults.length > 0 && userSearchQuery.length >= 2 && (
                          <SearchResultsOverlay>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              {userSearchResults.map(u => (
                                <ListRow 
                                  key={u.id}
                                  display="flex"
                                  align="center"
                                  spacing="md"
                                  padding="md"
                                  border="top"
                                  onClick={() => { setRecipientId(u.id); setUserSearchQuery(u.name); setUserSearchResults([]); }}
                                  width="full"
                                >
                                  <AvatarIcon width="10" height="10">
                                    <Text weight="bold" variant="subheading">{u.name[0]}</Text>
                                  </AvatarIcon>
                                  <Stack spacing="none" align="start" flex="1">
                                    <Text variant="list-title" color="black">{u.name}</Text>
                                    <Text variant="list-subtitle">{u.role?.name || "Member"}</Text>
                                  </Stack>
                                </ListRow>
                              ))}
                            </motion.div>
                          </SearchResultsOverlay>
                        )}
                      </AnimatePresence>
                    </Stack>
                  )}

                  <Stack spacing="xs">
                    <Text variant="subheading" weight="medium" color="black">
                      {t("attachment")}
                    </Text>
                    <Label 
                      asChild 
                    >
                      <UploadDropzone 
                        padding="md"
                      >
                        <Box marginBottom="xs" opacity="40">
                          <IconWrapper icon="paperclip" isGhost />
                        </Box>
                        <Text variant="subheading" weight="medium" color="black">
                          {attachments.length > 0 ? t("files_selected", { count: attachments.length }) : t("click_to_upload")}
                        </Text>
                        <Input 
                          type="file" 
                          multiple 
                          isHidden 
                          onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files || [])])} 
                        />
                      </UploadDropzone>
                    </Label>
                    {attachments.length > 0 && (
                      <Inline spacing="xs" wrap marginTop="sm">
                        {attachments.map((file, idx) => (
                          <Inline key={idx} spacing="xs" padding="xs" background="muted-soft" rounded="xl" border="subtle" align="center">
                            <IconWrapper icon="file-text" size="xs" isGhost color="primary" />
                            <Text variant="label-strong" lineClamp="1">
                              <Box maxWidth="button-group">{file.name}</Box>
                            </Text>
                              <IconWrapper 
                                icon="close" 
                                size="xs" 
                                isGhost 
                                color="destructive" 
                                onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                className="cursor-pointer"
                              />
                          </Inline>
                        ))}
                      </Inline>
                    )}
                  </Stack>
                </Stack>

                <Stack spacing="md" flex="1" minHeight="0">
                  <Stack spacing="xs" flex="1" minHeight="0">
                    <Text variant="subheading" weight="medium" color="black">
                      {t("body")}
                    </Text>
                    <Box flex="1" minHeight="0" display="flex" direction="col" height="full">
                      <Textarea 
                        value={body} 
                        onChange={(e) => setBody(e.target.value)} 
                        placeholder={t("body_placeholder")} 
                        required
                        className="flex-1 min-h-0 resize-none"
                      />
                    </Box>
                  </Stack>
                  
                  <Stack spacing="md">
                    <Button 
                      type="submit" 
                      disabled={submitting} 
                      variant="primary"
                      size="action"
                      rounded="xl"
                      fullWidth
                    >
                      {submitting ? t("sending") : <Inline spacing="xs" align="center"><IconWrapper icon="send" size="xs" isGhost /> {t("send_button")}</Inline>}
                    </Button>

                    <Inline justify="center" align="center" opacity="40" spacing="xs">
                      <IconWrapper preset="security-note" opacity="60" />
                      <Text variant="caption-muted">{t("security_note")}</Text>
                    </Inline>
                  </Stack>
                </Stack>
              </Box>
          </Box>
        </Form>
      </WorkspacePanelContent>
    </Box>
  );
}
