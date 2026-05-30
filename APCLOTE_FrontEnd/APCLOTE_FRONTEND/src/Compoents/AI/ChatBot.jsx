import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import { useLocation } from "react-router-dom";
import { buildApiUrl } from "../../config/api";

const API_BASE_URL = buildApiUrl("/chat");
const SMART_DOUBT_API_URL = buildApiUrl("/doubt/resolve");
const DETAILED_ANSWER_INSTRUCTION =
  "\n\n[Answer style: Give a detailed ChatGPT-style answer with clear sections, practical examples, step-by-step reasoning when useful, and a concise summary. Do not mention this instruction.]";
const ASSISTANT_SECTION_LABELS = [
  "Explanation",
  "Real-life example",
  "Example",
  "Key points",
  "Key point",
  "Summary",
  "Steps",
  "Answer",
  "Conclusion",
];

const dotAnimation = {
  "@keyframes blink": {
    "0%": { opacity: 0.25, transform: "translateY(0px)" },
    "50%": { opacity: 1, transform: "translateY(-3px)" },
    "100%": { opacity: 0.25, transform: "translateY(0px)" },
  },
};

const TypingIndicator = () => (
  <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2.5 }}>
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", maxWidth: "80%" }}>
      <Avatar
        sx={{
          width: 38,
          height: 38,
          bgcolor: "#0f766e",
          color: "white",
          boxShadow: `0 10px 30px ${alpha("#14b8a6", 0.25)}`,
        }}
      >
        <SmartToyRoundedIcon fontSize="small" />
      </Avatar>

      <Paper
        elevation={0}
        sx={{
          px: 2.25,
          py: 1.5,
          borderRadius: "20px 20px 20px 6px",
          bgcolor: alpha("#0f172a", 0.92),
          border: `1px solid ${alpha("#67e8f9", 0.14)}`,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          ...dotAnimation,
        }}
      >
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              bgcolor: "#67e8f9",
              animation: "blink 1.2s ease-in-out infinite",
              animationDelay: `${dot * 0.18}s`,
            }}
          />
        ))}
        <Typography variant="caption" sx={{ ml: 0.5, color: "rgba(226,232,240,0.86)" }}>
          Thinking...
        </Typography>
      </Paper>
    </Box>
  </Box>
);

const formatAssistantText = (text) => {
  const sectionPattern = ASSISTANT_SECTION_LABELS.map((label) => label.replace("-", "\\-")).join("|");

  return text
    .replace(/\r\n/g, "\n")
    .replace(/([a-z0-9.)])\s+(?=\d+\.\s+[A-Z])/g, "$1\n\n")
    .replace(new RegExp(`\\s+(?=(?:${sectionPattern}):)`, "gi"), "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const stripAnswerInstruction = (text = "") => String(text).replace(DETAILED_ANSWER_INSTRUCTION, "").trim();

const AssistantMessageContent = ({ text }) => {
  const blocks = formatAssistantText(text)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
      {blocks.map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (!lines.length) return null;

        const firstLine = lines[0];
        const remainingLines = lines.slice(1);
        const numberedHeadingMatch = firstLine.match(/^(\d+\.\s.+?[?.!])\s*(.*)$/);
        const sectionLabelMatch = firstLine.match(
          new RegExp(`^((?:${ASSISTANT_SECTION_LABELS.join("|")}):)\\s*(.*)$`, "i")
        );

        if (numberedHeadingMatch) {
          const heading = numberedHeadingMatch[1];
          const trailingBody = numberedHeadingMatch[2];
          const bodyLines = [...(trailingBody ? [trailingBody] : []), ...remainingLines];

          return (
            <Box key={`${heading}-${index}`} sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
              <Typography sx={{ fontWeight: 800, color: "#111827", lineHeight: 1.5 }}>
                {heading}
              </Typography>
              {bodyLines.map((line, lineIndex) => (
                <Typography
                  key={`${heading}-body-${lineIndex}`}
                  sx={{ color: "#334155", lineHeight: 1.8 }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          );
        }

        if (sectionLabelMatch) {
          const label = sectionLabelMatch[1];
          const trailingBody = sectionLabelMatch[2];
          const bodyLines = [...(trailingBody ? [trailingBody] : []), ...remainingLines];

          return (
            <Box key={`${label}-${index}`} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Typography sx={{ fontWeight: 700, color: "#4f46e5", lineHeight: 1.5 }}>
                {label}
              </Typography>
              {bodyLines.map((line, lineIndex) => (
                <Typography
                  key={`${label}-body-${lineIndex}`}
                  sx={{ color: "#334155", lineHeight: 1.8 }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          );
        }

        return (
          <Box key={`paragraph-${index}`} sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {lines.map((line, lineIndex) => {
              const isBullet = /^[-*•]\s+/.test(line);

              return (
                <Typography
                  key={`line-${index}-${lineIndex}`}
                  sx={{ color: "#334155", lineHeight: 1.8, pl: isBullet ? 1 : 0 }}
                >
                  {isBullet ? `• ${line.replace(/^[-*•]\s+/, "")}` : line}
                </Typography>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

const ChatBot = () => {
  const [topics, setTopics] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  const chatEndRef = useRef(null);
  const handledSmartDoubtRef = useRef("");

  const loadTopics = async () => {
    setSidebarLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/topics`,{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }});
      const data = await res.json();

      if (Array.isArray(data)) {
        setTopics(data);
      } else if (Array.isArray(data?.topics)) {
        setTopics(data.topics);
      } else {
        setTopics([]);
      }
    } catch (err) {
      setTopics([]);
      setError("Unable to load chat topics right now.");
    } finally {
      setSidebarLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const location = useLocation();

  useEffect(() => {
    const smartDoubtPayload = location.state?.smartDoubtPayload;

    if (!smartDoubtPayload) return;

    const requestKey = JSON.stringify(smartDoubtPayload);
    if (handledSmartDoubtRef.current === requestKey) return;

    handledSmartDoubtRef.current = requestKey;

    const resolveSmartDoubt = async () => {
      const topic = smartDoubtPayload.topic || "Doubt Session";

      setActiveTopic(topic);
      setMessages([]);
      setChatLoading(true);
      setError("");

      try {
        const res = await fetch(SMART_DOUBT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
          },
          body: JSON.stringify({
            videoId: smartDoubtPayload.videoId,
            currentTime: smartDoubtPayload.currentTime,
            type: "chatbot",
          }),
        });

        const data = await res.json();
        const reply = data?.reply || "I couldn't generate a response for this doubt.";
        const resolvedTopic = data?.topic || topic;

        setActiveTopic(resolvedTopic);
        const question = `Explain this part of the video:\n${smartDoubtPayload.topic}`;

     setMessages([
         {
           role: "user",
           text: question,
         },
         {
           role: "assistant",
           text: reply,
         },
        ]);

        await loadTopics();
      } catch (err) {
        setError("Could not resolve your doubt right now.");
        setMessages([
          {
            role: "assistant",
            text: "I'm having trouble reaching the smart doubt service right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    };

    resolveSmartDoubt();
  }, [location.state]);

  const loadChat = async (topic) => {
    setActiveTopic(topic);
    setMessages([]);
    setChatLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/${topic}`,{headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    }});
      const data = await res.json();

      const formatted = Array.isArray(data)
        ? data.map((message) => ({
            role: message.role,
            text: stripAnswerInstruction(message.content),
          }))
        : [];

      setMessages(formatted);
    } catch (err) {
      setError("Could not open that conversation.");
    } finally {
      setChatLoading(false);
    }
  };

  const newChat = () => {
    setActiveTopic(null);
    setMessages([]);
    setInput("");
    setError("");
    setMobileHistoryOpen(false);
  };

  const openChatTopic = async (topic) => {
    await loadChat(topic);
    setMobileHistoryOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    const userMessage = { role: "user", text: trimmedInput };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
       headers:{
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
    },
        body: JSON.stringify({
          topic: activeTopic,
          question: `${trimmedInput}${DETAILED_ANSWER_INSTRUCTION}`,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data?.reply || "I couldn't generate a response for that request.",
        },
      ]);

      await loadTopics();
    } catch (err) {
      setError("The reply could not be fetched. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having trouble reaching the server right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const hasConversation = messages.length > 0 || chatLoading || isLoading;

  const composer = (
    <Box className="mx-auto flex w-full max-w-4xl items-end gap-3">
      <TextField
        fullWidth
        multiline
        maxRows={5}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Ask your question here..."
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            alignItems: "flex-end",
            bgcolor: "#ffffff",
            color: "#111827",
            pr: 1,
            boxShadow: `0 14px 34px ${alpha("#4f46e5", 0.1)}`,
            "& fieldset": {
              borderColor: alpha("#4f46e5", 0.16),
            },
            "&:hover fieldset": {
              borderColor: alpha("#06b6d4", 0.34),
            },
            "&.Mui-focused fieldset": {
              borderColor: alpha("#4f46e5", 0.62),
            },
          },
          "& .MuiInputBase-input::placeholder": {
            color: "rgba(71,85,105,0.62)",
            opacity: 1,
          },
        }}
      />

      <IconButton
        onClick={sendMessage}
        disabled={!input.trim() || isLoading}
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3.5,
          color: "white",
          background:
            !input.trim() || isLoading
              ? alpha("#94a3b8", 0.7)
              : "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
          boxShadow:
            !input.trim() || isLoading
              ? "none"
              : `0 18px 32px ${alpha("#4f46e5", 0.24)}`,
        }}
      >
        <SendRoundedIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box
      className="min-h-screen w-full p-2 sm:p-4"
      sx={{
        minHeight: "calc(100dvh - var(--app-navbar-height))",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(6,182,212,0.1), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <Box
        className="ai-workspace mx-auto flex w-full overflow-hidden rounded-[22px] border backdrop-blur-xl"
        sx={{
          height: {
            xs: "calc(100dvh - var(--app-navbar-height) - 24px)",
            sm: "calc(100dvh - var(--app-navbar-height) - 40px)",
          },
          bgcolor: alpha("#ffffff", 0.88),
          borderColor: alpha("#4f46e5", 0.12),
          boxShadow: `0 24px 70px ${alpha("#4f46e5", 0.14)}`,
        }}
      >
        <Box
          className="hidden w-[320px] shrink-0 flex-col border-r lg:flex"
          sx={{
            borderColor: alpha("#4f46e5", 0.1),
            background: `linear-gradient(180deg, ${alpha("#ffffff", 0.98)} 0%, ${alpha("#eef2ff", 0.8)} 100%)`,
          }}
        >
          <Box className="p-6">
            <Box className="flex items-center gap-3">
              <Avatar
                className="ai-float"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: alpha("#4f46e5", 0.12),
                  color: "#4f46e5",
                }}
              >
                <ForumRoundedIcon />
              </Avatar>

              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
                  Chat Studio
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                  Smarter conversations, cleaner workflow.
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={newChat}
              sx={{
                mt: 3,
                py: 1.4,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                boxShadow: `0 16px 30px ${alpha("#4f46e5", 0.24)}`,
              }}
            >
              Start New Chat
            </Button>

            <Box className="mt-4 flex flex-wrap gap-2">
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label="AI Powered"
                sx={{
                  bgcolor: alpha("#4f46e5", 0.1),
                  color: "#4338ca",
                  borderRadius: 999,
                }}
              />
              <Chip
                label={`${topics.length} topics`}
                sx={{
                  bgcolor: alpha("#06b6d4", 0.1),
                  color: "#0e7490",
                  borderRadius: 999,
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: alpha("#4f46e5", 0.1) }} />

          <Box className="no-scrollbar flex-1 overflow-y-auto px-4 py-5">
            <Typography sx={{ px: 1.5, fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: 1.2 }}>
              RECENT TOPICS
            </Typography>

            <Box className="mt-3 flex flex-col gap-2">
              {sidebarLoading ? (
                <Typography sx={{ px: 1.5, color: "rgba(226,232,240,0.7)" }}>
                  Loading topics...
                </Typography>
              ) : topics.length ? (
                topics.map((topic, index) => (
                  <Paper
                    key={`${topic}-${index}`}
                    elevation={0}
                    onClick={() => openChatTopic(topic)}
                    sx={{
                      p: 1.6,
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "#334155",
                      bgcolor:
                        activeTopic === topic ? alpha("#4f46e5", 0.1) : "#ffffff",
                      border: `1px solid ${
                        activeTopic === topic
                          ? alpha("#4f46e5", 0.3)
                          : alpha("#4f46e5", 0.09)
                      }`,
                      transition: "all 0.22s ease",
                      "&:hover": {
                        bgcolor: alpha("#06b6d4", 0.1),
                        transform: "translateX(4px) scale(1.01)",
                        boxShadow: `0 12px 28px ${alpha("#4f46e5", 0.1)}`,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.4 }}>{topic}</Typography>
                  </Paper>
                ))
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    border: `1px dashed ${alpha("#4f46e5", 0.16)}`,
                    color: "#64748b",
                  }}
                >
                  Your saved conversations will appear here.
                </Paper>
              )}
            </Box>
          </Box>
        </Box>

        <Box className="flex min-w-0 flex-1 flex-col">
          <Box
            className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-4 sm:px-6"
            sx={{ bgcolor: alpha("#ffffff", 0.78), borderColor: alpha("#4f46e5", 0.1) }}
          >
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>
                {activeTopic || "New Conversation"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                Ask questions, revisit past topics, and keep the flow going.
              </Typography>
            </Box>

            <Box className="flex gap-2">
              <Button
                className="lg:!hidden"
                startIcon={<MenuRoundedIcon />}
                variant="outlined"
                onClick={() => setMobileHistoryOpen(true)}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  px: 2,
                  color: "#4f46e5",
                  borderColor: alpha("#4f46e5", 0.22),
                }}
              >
                History
              </Button>
              <Button
                startIcon={<AddRoundedIcon />}
                variant="outlined"
                onClick={newChat}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  px: 2,
                  color: "#4f46e5",
                  borderColor: alpha("#4f46e5", 0.22),
                }}
              >
                New Chat
              </Button>
            </Box>
          </Box>

          <Box
            className="no-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            sx={{
              background:
                "linear-gradient(180deg, rgba(238,242,255,0.58) 0%, rgba(255,255,255,0.96) 100%)",
            }}
          >
            {error ? (
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  px: 2,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: alpha("#ef4444", 0.12),
                  color: "#b91c1c",
                  border: `1px solid ${alpha("#ef4444", 0.24)}`,
                }}
              >
                {error}
              </Paper>
            ) : null}

            {!messages.length && !chatLoading ? (
              <Box className="flex min-h-full items-center justify-center py-8">
                <Paper
                  elevation={0}
                  className="ai-card-pop w-full max-w-3xl rounded-[24px] border px-5 py-6 text-center sm:px-6 sm:py-8"
                  sx={{
                    bgcolor: alpha("#ffffff", 0.96),
                    borderColor: alpha("#4f46e5", 0.12),
                    boxShadow: `0 24px 64px ${alpha("#4f46e5", 0.13)}`,
                  }}
                >
                  <Avatar
                    className="ai-pulse-ring ai-float"
                    sx={{
                      width: 64,
                      height: 64,
                      mx: "auto",
                      mb: 2,
                      bgcolor: alpha("#4f46e5", 0.1),
                      color: "#4f46e5",
                    }}
                  >
                    <SmartToyRoundedIcon fontSize="medium" />
                  </Avatar>

                  <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
                    Start a sharper AI conversation
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1.5,
                      maxWidth: 520,
                      mx: "auto",
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#64748b",
                    }}
                  >
                    Ask for guidance, summaries, or solutions. Your recent topics stay organized
                    on the left, and the assistant will show a live buffering animation while a
                    reply is loading.
                  </Typography>
                  <Box sx={{ mt: 4 }}>{composer}</Box>
                </Paper>
              </Box>
            ) : (
              <>
                {chatLoading ? (
                    <Typography sx={{ color: "#64748b" }}>
                    Loading conversation...
                  </Typography>
                ) : null}

                {messages.map((message, index) => {
                  const isUser = message.role === "user";

                  return (
                    <Box
                      key={`${message.role}-${index}`}
                      sx={{
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "center",
                        mb: isUser ? 2.5 : 3.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: isUser ? "flex-end" : "flex-start",
                          flexDirection: isUser ? "row-reverse" : "row",
                          width: isUser ? "auto" : "100%",
                          maxWidth: isUser ? { xs: "100%", md: "82%" } : 920,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: isUser ? alpha("#4f46e5", 0.12) : alpha("#06b6d4", 0.12),
                            color: isUser ? "#4f46e5" : "#0e7490",
                          }}
                        >
                          {isUser ? "U" : <SmartToyRoundedIcon fontSize="small" />}
                        </Avatar>

                        <Paper
                          className="ai-card-pop"
                          elevation={0}
                          sx={{
                            px: 2.25,
                            py: 1.6,
                            borderRadius: isUser
                              ? "20px 20px 6px 20px"
                              : "0",
                            bgcolor: isUser ? undefined : "transparent",
                            background: isUser ? "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" : undefined,
                            color: isUser ? "#ffffff" : "#111827",
                            border: `1px solid ${
                              isUser ? alpha("#4f46e5", 0.18) : "transparent"
                            }`,
                            boxShadow: isUser ? `0 16px 36px ${alpha("#4f46e5", 0.12)}` : "none",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.75,
                            wordBreak: "break-word",
                          }}
                        >
                          {isUser ? message.text : <AssistantMessageContent text={message.text} />}
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}

                {isLoading ? <TypingIndicator /> : null}
              </>
            )}

            <div ref={chatEndRef} />
          </Box>

          {hasConversation ? (
            <Box
              className="border-t p-4 sm:p-5"
              sx={{ bgcolor: alpha("#ffffff", 0.92), borderColor: alpha("#4f46e5", 0.1) }}
            >
              {composer}
            </Box>
          ) : null}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={mobileHistoryOpen}
        onClose={() => setMobileHistoryOpen(false)}
        PaperProps={{
          sx: {
            width: "min(86vw, 340px)",
            bgcolor: "#ffffff",
            borderRight: `1px solid ${alpha("#4f46e5", 0.12)}`,
          },
        }}
      >
        <Box className="flex h-full flex-col">
          <Box className="flex items-center justify-between border-b px-4 py-4" sx={{ borderColor: alpha("#4f46e5", 0.1) }}>
            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>Chats</Typography>
              <Typography sx={{ fontSize: 13, color: "#64748b" }}>{topics.length} saved topics</Typography>
            </Box>
            <IconButton onClick={() => setMobileHistoryOpen(false)} sx={{ color: "#4f46e5" }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          <Box className="p-4">
            <Button
              fullWidth
              startIcon={<AddRoundedIcon />}
              variant="contained"
              onClick={newChat}
              sx={{
                py: 1.2,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 800,
                background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              }}
            >
              New Chat
            </Button>
          </Box>

          <Box className="no-scrollbar flex-1 overflow-y-auto px-4 pb-5">
            <Typography sx={{ mb: 1.5, fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: 1.1 }}>
              RECENT
            </Typography>
            <Box className="flex flex-col gap-2">
              {sidebarLoading ? (
                <Typography sx={{ color: "#64748b" }}>Loading topics...</Typography>
              ) : topics.length ? (
                topics.map((topic, index) => (
                  <Paper
                    key={`${topic}-mobile-${index}`}
                    elevation={0}
                    onClick={() => openChatTopic(topic)}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      cursor: "pointer",
                      color: "#334155",
                      bgcolor: activeTopic === topic ? alpha("#4f46e5", 0.1) : "#ffffff",
                      border: `1px solid ${activeTopic === topic ? alpha("#4f46e5", 0.3) : alpha("#4f46e5", 0.09)}`,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, lineHeight: 1.4 }}>{topic}</Typography>
                  </Paper>
                ))
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha("#eef2ff", 0.7),
                    color: "#64748b",
                    border: `1px dashed ${alpha("#4f46e5", 0.16)}`,
                  }}
                >
                  Your chat history will appear here.
                </Paper>
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default ChatBot;
