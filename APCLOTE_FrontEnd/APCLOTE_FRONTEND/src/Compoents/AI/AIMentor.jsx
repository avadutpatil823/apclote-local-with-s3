import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import HearingRoundedIcon from "@mui/icons-material/HearingRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { useLocation } from "react-router-dom";
import AIMentorQuiz from "./AIMentorQuiz";
import { buildApiUrl } from "../../config/api";

const API_URL = buildApiUrl("/mentor");
const SMART_DOUBT_API_URL = buildApiUrl("/doubt/resolve");
const BREATH_PAUSE_MS = 4000;
const SEND_PAUSE_MS = 5000;
const RECOGNITION_GUARD_MS = 1200;
const SCROLL_BOTTOM_THRESHOLD_PX = 120;
const MENTOR_SESSION_STORAGE_KEY = "apclote.mentor.current-session";

const readStoredMentorSession = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.sessionStorage.getItem(MENTOR_SESSION_STORAGE_KEY);

    if (!rawSession) return null;

    const parsedSession = JSON.parse(rawSession);
    const parsedMessages = Array.isArray(parsedSession?.messages)
      ? parsedSession.messages
          .filter(
            (message) =>
              message &&
              (message.role === "user" || message.role === "bot") &&
              typeof message.text === "string"
          )
          .map((message) => ({
            role: message.role,
            text: message.text,
          }))
      : [];

    return {
      mode: typeof parsedSession?.mode === "string" ? parsedSession.mode : "mentor",
      interviewTopic:
        typeof parsedSession?.interviewTopic === "string" ? parsedSession.interviewTopic : "",
      messages: parsedMessages,
    };
  } catch (error) {
    return null;
  }
};

const MODES = [
  {
    key: "mentor",
    label: "Mentor",
    blurb: "Ask for learning help, explanations, and confidence-building guidance.",
  },
  {
    key: "interview",
    label: "Interview",
    blurb: "Practice spoken answers and get evaluation after you finish responding.",
  },
  {
    key: "quiz",
    label: "Quiz",
    blurb: "Get questions, challenge prompts, and fast knowledge checks.",
  },
  {
    key: "career",
    label: "Career",
    blurb: "Talk through growth paths, resumes, and next-step planning.",
  },
  {
    key: "coding",
    label: "Coding",
    blurb: "Discuss debugging, concepts, and how to solve implementation problems.",
  },
];

const statusPulse = {
  "@keyframes mentorPulse": {
    "0%": { transform: "scale(0.94)", opacity: 0.6 },
    "50%": { transform: "scale(1)", opacity: 1 },
    "100%": { transform: "scale(0.94)", opacity: 0.6 },
  },
};

const SoundWave = ({ active }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end",
      gap: 0.5,
      height: 28,
      ...statusPulse,
      "@keyframes wave": {
        "0%, 100%": { transform: "scaleY(0.45)" },
        "50%": { transform: "scaleY(1)" },
      },
    }}
  >
    {[0, 1, 2, 3].map((bar) => (
      <Box
        key={bar}
        sx={{
          width: 4,
          height: 16 + bar * 3,
          borderRadius: 999,
          bgcolor: active ? "#67e8f9" : alpha("#67e8f9", 0.25),
          transformOrigin: "bottom",
          animation: active ? "wave 1s ease-in-out infinite" : "none",
          animationDelay: `${bar * 0.1}s`,
        }}
      />
    ))}
  </Box>
);

const ThinkingBubble = () => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-end", mb: 2.5 }}>
    <Avatar
      sx={{
        width: 42,
        height: 42,
        bgcolor: alpha("#38bdf8", 0.16),
        color: "#bae6fd",
      }}
    >
      <PsychologyRoundedIcon fontSize="small" />
    </Avatar>

    <Paper
      elevation={0}
      sx={{
        px: 2.25,
        py: 1.6,
        borderRadius: "22px 22px 22px 8px",
        bgcolor: alpha("#082f49", 0.7),
        border: `1px solid ${alpha("#67e8f9", 0.18)}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          ...statusPulse,
        }}
      >
        <SoundWave active />
        <Typography sx={{ color: "#e0f2fe", fontSize: 13, fontWeight: 600 }}>
          Dummi X is analyzing your response...
        </Typography>
      </Box>
    </Paper>
  </Box>
);

const StatusChip = ({ active, icon, label, tone }) => {
  const colors = {
    cyan: {
      bg: alpha("#22d3ee", active ? 0.18 : 0.08),
      text: active ? "#cffafe" : "rgba(207,250,254,0.75)",
      border: alpha("#22d3ee", active ? 0.4 : 0.14),
    },
    amber: {
      bg: alpha("#f59e0b", active ? 0.18 : 0.08),
      text: active ? "#fde68a" : "rgba(253,230,138,0.75)",
      border: alpha("#f59e0b", active ? 0.4 : 0.14),
    },
    emerald: {
      bg: alpha("#34d399", active ? 0.18 : 0.08),
      text: active ? "#d1fae5" : "rgba(209,250,229,0.75)",
      border: alpha("#34d399", active ? 0.4 : 0.14),
    },
  };

  const palette = colors[tone];

  return (
    <Chip
      icon={icon}
      label={label}
      sx={{
        height: 38,
        borderRadius: 999,
        bgcolor: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
        "& .MuiChip-icon": {
          color: palette.text,
        },
      }}
    />
  );
};

const AIMentor = () => {
  const [persistedSession] = useState(() => readStoredMentorSession());
  const [mode, setMode] = useState(persistedSession?.mode || "mentor");
  const [interviewTopic, setInterviewTopic] = useState(persistedSession?.interviewTopic || "");
  const [messages, setMessages] = useState(persistedSession?.messages || []);
  const [sessionActive, setSessionActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const sessionTimer = useRef(null);
  const recognitionRestartTimer = useRef(null);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const voicesLoadedRef = useRef([]);
  const speechBufferRef = useRef("");
  const pendingUserMessageRef = useRef(false);
  const ignoreRecognitionUntilRef = useRef(0);
  const handledSmartDoubtRef = useRef("");
  const shouldStickToBottomRef = useRef(true);

  const isSpeakingRef = useRef(false);
  const processingRef = useRef(false);
  const interviewModeRef = useRef(false);
  const sessionActiveRef = useRef(false);
  const endingSessionRef = useRef(false);

  const activeMode = MODES.find((item) => item.key === mode) || MODES[0];
  const isQuizMode = mode === "quiz";

  const clearTimers = () => {
    clearTimeout(silenceTimer.current);
    clearTimeout(sessionTimer.current);
    clearTimeout(recognitionRestartTimer.current);
  };

  const resetSpeechBuffer = () => {
    speechBufferRef.current = "";
    pendingUserMessageRef.current = false;
  };

  const syncScrollLock = () => {
    const container = chatContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldStickToBottomRef.current = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD_PX;
  };

  useEffect(() => {
    if (!shouldStickToBottomRef.current) return;

    shouldStickToBottomRef.current = true;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processing]);

  useEffect(() => {
    return () => {
      clearTimers();
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  useEffect(() => {
    processingRef.current = processing;
  }, [processing]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      voicesLoadedRef.current = synth.getVoices();
    };

    loadVoices();
    synth.addEventListener?.("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(
        MENTOR_SESSION_STORAGE_KEY,
        JSON.stringify({
          mode,
          interviewTopic,
          messages,
        })
      );
    } catch (error) {
    }
  }, [interviewTopic, messages, mode]);


const location = useLocation();

  useEffect(() => {
    const smartDoubtPayload = location.state?.smartDoubtPayload;

    if (!smartDoubtPayload) return;

    const requestKey = JSON.stringify(smartDoubtPayload);
    if (handledSmartDoubtRef.current === requestKey) return;

    handledSmartDoubtRef.current = requestKey;

    const resolveSmartDoubt = async () => {
      setMode("mentor");
      setProcessing(true);
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
            type: "mentor",
          }),
        });

        const data = await res.json();
        const reply = data?.reply || "No response from mentor.";
        const doubtPrompt = smartDoubtPayload.topic
          ? `Help me with this part of the video: ${smartDoubtPayload.topic}`
          : `Help me understand the video around ${Math.round(
              smartDoubtPayload.currentTime || 0
            )} seconds.`;

        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            text: doubtPrompt,
          },
          {
            role: "bot",
            text: reply,
          },
        ]);

        speak(reply);
      } catch (err) {
        setError("Could not resolve your doubt right now.");
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "I couldn't reach the smart doubt service right now. Please try again shortly.",
          },
        ]);
      } finally {
        setProcessing(false);
      }
    };

    resolveSmartDoubt();
  }, [location.state]);

  const resetSessionTimer = () => {
    clearTimeout(sessionTimer.current);

    if (!sessionActiveRef.current || endingSessionRef.current) return;

    sessionTimer.current = setTimeout(() => {
      if (!sessionActiveRef.current || endingSessionRef.current) return;

      if (isSpeakingRef.current || processingRef.current) {
        resetSessionTimer();
        return;
      }

      endSession("Session ended due to inactivity. Start again whenever you're ready.");
    }, 40000);
  };

  const getVoice = () => {
    const voices = voicesLoadedRef.current.length
      ? voicesLoadedRef.current
      : window.speechSynthesis.getVoices();

    const preferredVoiceMatchers = [
      "aria",
      "jenny",
      "samantha",
      "zira",
      "ava",
      "alloy",
      "female",
      "woman",
      "google us english",
    ];

    return (
      voices.find((voice) => {
        const name = voice.name.toLowerCase();
        return (
          voice.lang?.toLowerCase().startsWith("en") &&
          preferredVoiceMatchers.some((matcher) => name.includes(matcher))
        );
      }) ||
      voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ||
      voices[0]
    );
  };

  const stopRecognition = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
    }
  };

  const startRecognition = (delay = 0) => {
    clearTimeout(recognitionRestartTimer.current);

    recognitionRestartTimer.current = setTimeout(() => {
      if (
        !recognitionRef.current ||
        !sessionActiveRef.current ||
        isSpeakingRef.current ||
        endingSessionRef.current
      ) {
        return;
      }

      try {
        recognitionRef.current.start();
      } catch (err) {
      }
    }, delay);
  };

  const speak = (
    text,
    { restartListening = sessionActiveRef.current, resetTimer = sessionActiveRef.current } = {}
  ) => {
    const synth = window.speechSynthesis;
    const cleaned = text.replace(/[*•]/g, "").replace(/\s+/g, " ").trim();

    if (!cleaned) return;

    ignoreRecognitionUntilRef.current = Date.now() + RECOGNITION_GUARD_MS;
    stopRecognition();
    clearTimeout(sessionTimer.current);
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(cleaned);

    isSpeakingRef.current = true;
    setSpeaking(true);
    setListening(false);

    utterance.voice = getVoice();
    utterance.rate = 0.94;
    utterance.pitch = 1.02;

    utterance.onend = () => {
      isSpeakingRef.current = false;
      setSpeaking(false);
      ignoreRecognitionUntilRef.current = Date.now() + 500;

      if (restartListening && sessionActiveRef.current) {
        startRecognition(350);
      }

      if (resetTimer && sessionActiveRef.current) {
        resetSessionTimer();
      }

      if (!sessionActiveRef.current) {
        endingSessionRef.current = false;
      }
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setSpeaking(false);

      if (restartListening && sessionActiveRef.current) {
        startRecognition(350);
      }

      if (resetTimer && sessionActiveRef.current) {
        resetSessionTimer();
      }
    };

    synth.speak(utterance);
  };

  const buildInterviewStartPrompt = (topic) =>
    `You are conducting a spoken mock interview on "${topic}". Ask exactly one interview question at a time. Keep every question focused only on ${topic}. Do not switch to a different subject. Start with the first interview question only.`;

  const buildInterviewFollowUpPrompt = (topic, answer) =>
    `You are conducting a spoken mock interview on "${topic}". The candidate answered:\n"${answer}"\nAsk exactly one next interview question on ${topic}. Do not change topic.`;

  const buildInterviewEvaluationPrompt = (topic, answer) =>
    `You are conducting a spoken mock interview on "${topic}". The candidate has completed this answer:\n"${answer}"\nBriefly evaluate the answer, then ask exactly one next interview question on ${topic}.`;

  const sendToBackend = async (text) => {
    const payload = text.trim();
    if (!payload) return;

    try {
      processingRef.current = true;
      clearTimeout(sessionTimer.current);
      setProcessing(true);
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
        },
        body: JSON.stringify({
          input: payload,
          mode,
        }),
      });

      const data = await res.json();
      const reply = data?.reply || "No response from mentor.";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      speak(reply);
    } catch (err) {
      setError("Backend not reachable.");
    } finally {
      processingRef.current = false;
      setProcessing(false);

      if (sessionActiveRef.current && !isSpeakingRef.current) {
        resetSessionTimer();
      }
    }
  };

  const upsertBufferedUserMessage = (text) => {
    setMessages((prev) => {
      if (pendingUserMessageRef.current && prev[prev.length - 1]?.role === "user") {
        return [...prev.slice(0, -1), { role: "user", text }];
      }

      pendingUserMessageRef.current = true;
      return [...prev, { role: "user", text }];
    });
  };

  const handleSpeech = (text) => {
    const spokenText = text.trim();
    if (!spokenText) return;

    const completionPattern = /i have completed(?: the answer)?/i;
    const completionTriggered = interviewModeRef.current && completionPattern.test(spokenText);
    const cleanedText = spokenText.replace(/i have completed(?: the answer)?/gi, "").trim();

    const nextBufferedSpeech = `${speechBufferRef.current} ${cleanedText}`
      .replace(/\s+/g, " ")
      .trim();

    speechBufferRef.current = nextBufferedSpeech;

    if (nextBufferedSpeech) {
      upsertBufferedUserMessage(nextBufferedSpeech);
    }

    resetSessionTimer();
    clearTimeout(silenceTimer.current);

    if (completionTriggered) {
      const finalAnswer = speechBufferRef.current;
      resetSpeechBuffer();

      if (finalAnswer) {
        sendToBackend(buildInterviewEvaluationPrompt(interviewTopic.trim(), finalAnswer));
      } else {
        setError("Please answer the interview question before asking for evaluation.");
      }
      return;
    }

    silenceTimer.current = setTimeout(() => {
      const bufferedSpeech = speechBufferRef.current;
      resetSpeechBuffer();

      if (!bufferedSpeech) return;

      if (interviewModeRef.current) {
        sendToBackend(buildInterviewFollowUpPrompt(interviewTopic.trim(), bufferedSpeech));
        return;
      }

      sendToBackend(bufferedSpeech);
    }, SEND_PAUSE_MS);
  };

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);

      if (sessionActiveRef.current && !isSpeakingRef.current && !endingSessionRef.current) {
        startRecognition(250);
      }
    };
    recognition.onerror = (err) => {
      setError("Microphone access failed. Please check browser permissions.");
    };
    recognition.onresult = (event) => {
      if (isSpeakingRef.current || Date.now() < ignoreRecognitionUntilRef.current) return;
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleSpeech(transcript);
    };

    recognitionRef.current = recognition;
    return true;
  };

  const startSession = () => {
    if (sessionActive) return;

    if (mode === "interview" && !interviewTopic.trim()) {
      setError("Please enter interview topic");
      return;
    }

    const initialized = initRecognition();
    if (!initialized) return;

    setSessionActive(true);
    sessionActiveRef.current = true;
    interviewModeRef.current = mode === "interview";
    endingSessionRef.current = false;
    setError("");
    resetSpeechBuffer();
    resetSessionTimer();

    if (mode === "interview") {
      const topic = interviewTopic.trim();

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `Interview mode started for ${topic}. I will ask one question at a time.` },
      ]);

      sendToBackend(buildInterviewStartPrompt(topic));
      return;
    }

    startRecognition(250);
    speak(`Hello, I am Dummi X, your ${activeMode.label.toLowerCase()} assistant. Tell me what you want help with.`);
  };

  const stopQuestion = () => {
    window.speechSynthesis.cancel();
    clearTimeout(silenceTimer.current);
    setSpeaking(false);
    setProcessing(false);
    speak("Okay, I have stopped. Continue whenever you are ready.");
  };

  const endSession = (message = "Session ended. Goodbye.") => {
    if (endingSessionRef.current) return;
    if (!sessionActiveRef.current && !listening && !speaking && !processing) return;

    endingSessionRef.current = true;
    sessionActiveRef.current = false;
    stopRecognition();
    window.speechSynthesis.cancel();
    clearTimers();

    setSessionActive(false);
    setListening(false);
    setProcessing(false);
    setSpeaking(false);

    isSpeakingRef.current = false;
    interviewModeRef.current = false;
    resetSpeechBuffer();

    setMessages((prev) => [...prev, { role: "bot", text: message }]);
    speak(message, { restartListening: false, resetTimer: false });
  };

  return (
    <Box
      className="w-full px-2 py-3 sm:px-4"
      sx={{
        minHeight: "calc(100dvh - var(--app-navbar-height))",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 28%), radial-gradient(circle at top right, rgba(6,182,212,0.1), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <Box
        className="ai-workspace mx-auto w-full overflow-hidden rounded-[22px] border"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "280px minmax(0, 1fr) 300px",
          },
          height: {
            xs: "calc(100dvh - var(--app-navbar-height) - 32px)",
            sm: "calc(100dvh - var(--app-navbar-height) - 40px)",
          },
          minHeight: {
            xs: "calc(100dvh - var(--app-navbar-height) - 32px)",
            xl: 0,
          },
          bgcolor: alpha("#ffffff", 0.9),
          borderColor: alpha("#4f46e5", 0.12),
          backdropFilter: "blur(18px)",
          boxShadow: `0 24px 70px ${alpha("#4f46e5", 0.14)}`,
        }}
      >
        <Box
          className="no-scrollbar hidden min-h-0 overflow-y-auto border-r xl:block"
          sx={{
            borderColor: alpha("#4f46e5", 0.1),
            background: `linear-gradient(180deg, ${alpha("#ffffff", 0.98)} 0%, ${alpha("#eef2ff", 0.78)} 100%)`,
          }}
        >
          <Box className="p-5">
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                className="ai-float"
                sx={{
                  position: "relative",
                  width: 60,
                  height: 60,
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: `1px solid ${alpha("#4f46e5", 0.16)}`,
                  boxShadow: `0 18px 40px ${alpha("#4f46e5", 0.18)}`,
                }}
              >
                <img
                  src="/models/mentor.jpg"
                  alt="AI Mentor"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                  Dummi X
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                  Voice-first mentor assistance with live coaching energy.
                </Typography>
              </Box>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 4,
                bgcolor: "#ffffff",
                border: `1px solid ${alpha("#4f46e5", 0.1)}`,
              }}
            >
              <Typography sx={{ color: "#111827", fontWeight: 700, fontSize: 16 }}>
                Current Focus
              </Typography>
              <Typography sx={{ mt: 1, color: "#64748b", lineHeight: 1.7 }}>
                {activeMode.blurb}
              </Typography>
            </Paper>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <StatusChip
                active={listening}
                tone="cyan"
                icon={<HearingRoundedIcon />}
                label={listening ? "Listening" : "Idle"}
              />
              <StatusChip
                active={processing}
                tone="amber"
                icon={<AutoAwesomeRoundedIcon />}
                label={processing ? "Analyzing" : "Ready"}
              />
              <StatusChip
                active={speaking}
                tone="emerald"
                icon={<RecordVoiceOverRoundedIcon />}
                label={speaking ? "Speaking" : "Quiet"}
              />
            </Stack>
          </Box>

          <Box className="px-5 pb-5">
            <Typography
              sx={{
                mb: 1.5,
                color: "#64748b",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              QUICK GUIDANCE
            </Typography>

            <Stack spacing={1.5}>
              {(isQuizMode
                ? [
                    "Use the number grid to jump to any question instantly.",
                    "Pick one option per question, then use Next and Previous to move around.",
                    "Submit the quiz to see attempted, correct, wrong, and answer highlights.",
                  ]
                : [
                    "Start Session to activate live voice mentoring.",
                    "In interview mode, enter a topic like Java before starting.",
                    'Say "I have completed the answer" to get evaluation and the next question.',
                  ]
              ).map((item) => (
                <Paper
                  key={item}
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: 3,
                    bgcolor: "#ffffff",
                    border: `1px solid ${alpha("#4f46e5", 0.1)}`,
                    color: "#475569",
                  }}
                >
                  {item}
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box
          className="min-h-0 min-w-0"
          sx={{
            display: "grid",
            gridTemplateRows: "auto minmax(0, 1fr)",
            overflow: "hidden",
          }}
        >
          <Box
            className="border-b px-4 py-3 sm:px-5"
            sx={{ bgcolor: alpha("#ffffff", 0.8), borderColor: alpha("#4f46e5", 0.1) }}
          >
            <Box className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Box className="min-w-0">
                <Typography sx={{ fontSize: { xs: 22, sm: 24 }, fontWeight: 800, color: "#111827" }}>
                  Real-Time AI Mentor Assistance
                </Typography>
                <Typography sx={{ mt: 0.25, color: "#64748b", fontSize: 14 }}>
                  Choose a coaching mode, start the live session, and let Dummi X guide the
                  conversation naturally.
                </Typography>
              </Box>

              <Box className="flex flex-wrap gap-2">
                {MODES.map((item) => {
                  const active = mode === item.key;

                  return (
                    <Button
                      key={item.key}
                      onClick={() => setMode(item.key)}
                      disabled={sessionActive}
                      variant={active ? "contained" : "outlined"}
                        sx={{
                        px: 1.8,
                        py: 0.8,
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 700,
                        color: active ? "#ffffff" : "#4f46e5",
                        borderColor: alpha("#4f46e5", 0.2),
                        background: active
                          ? "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)"
                          : "#ffffff",
                        boxShadow: active ? `0 14px 30px ${alpha("#4f46e5", 0.18)}` : "none",
                        transition: "all 0.22s ease",
                        "&:hover": {
                          transform: sessionActive ? "none" : "translateY(-2px)",
                          boxShadow: sessionActive ? "none" : `0 14px 30px ${alpha("#4f46e5", 0.14)}`,
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Box>

          <Box
            className="min-h-0"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1fr)",
              },
              gridTemplateRows: "minmax(0, 1fr) auto",
              overflow: "hidden",
            }}
          >
            <Box
              className="min-h-0"
              sx={{
                display: "grid",
                gridTemplateRows: "minmax(0, 1fr) auto",
                overflow: "hidden",
              }}
            >
              <Box
                className="no-scrollbar overflow-y-auto px-4 py-4 sm:px-5"
                ref={chatContainerRef}
                onScroll={syncScrollLock}
                sx={{
                  background:
                    "linear-gradient(180deg, rgba(238,242,255,0.58) 0%, rgba(255,255,255,0.96) 100%)",
                }}
              >
                {!isQuizMode && error ? (
                  <Paper
                    elevation={0}
                    sx={{
                      mb: 2.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      bgcolor: alpha("#ef4444", 0.12),
                      color: "#b91c1c",
                      border: `1px solid ${alpha("#ef4444", 0.2)}`,
                    }}
                  >
                    {error}
                  </Paper>
                ) : null}

                {isQuizMode ? (
                  <AIMentorQuiz />
                ) : !messages.length ? (
                  <Box className="flex min-h-full items-start justify-center py-5">
                    <Paper
                      elevation={0}
                      className="w-full max-w-4xl rounded-[24px] border px-5 py-5 text-center sm:px-6 sm:py-6"
                      sx={{
                        bgcolor: alpha("#ffffff", 0.96),
                        borderColor: alpha("#4f46e5", 0.12),
                        boxShadow: `0 24px 64px ${alpha("#4f46e5", 0.13)}`,
                      }}
                    >
                      <Box
                        className="ai-pulse-ring ai-float"
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 82,
                          height: 82,
                          mx: "auto",
                          mb: 2,
                          borderRadius: "28px",
                          color: "#4f46e5",
                          background:
                            "linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(6,182,212,0.12) 100%)",
                          border: `1px solid ${alpha("#4f46e5", 0.12)}`,
                          boxShadow: `0 18px 42px ${alpha("#4f46e5", 0.12)}`,
                        }}
                      >
                        <PsychologyRoundedIcon sx={{ fontSize: 36 }} />
                        <SoundWave active={listening || processing || speaking} />
                      </Box>

                      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        <Chip label={activeMode.label} sx={{ bgcolor: alpha("#4f46e5", 0.1), color: "#4338ca", fontWeight: 700 }} />
                        <Chip label={sessionActive ? "Live session" : "Ready"} sx={{ bgcolor: alpha("#06b6d4", 0.1), color: "#0e7490", fontWeight: 700 }} />
                      </Stack>

                      <Typography sx={{ fontSize: { xs: 26, lg: 30 }, fontWeight: 800, color: "#111827" }}>
                        Meet Dummi X, your live AI mentor
                      </Typography>
                      <Typography
                        sx={{
                          mt: 1.5,
                          maxWidth: 580,
                          mx: "auto",
                          lineHeight: 1.8,
                          color: "#64748b",
                        }}
                      >
                        Dummi X listens, thinks, and responds like a guided mentor assistant. Start
                        the session to enter a more immersive support flow for interview practice,
                        learning, coding help, or career coaching.
                      </Typography>

                      <Box className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {MODES.map((item) => {
                          const active = mode === item.key;

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setMode(item.key)}
                              disabled={sessionActive}
                              className="ai-card-pop rounded-lg border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
                              style={{
                                borderColor: active ? "rgba(79,70,229,0.42)" : "rgba(79,70,229,0.12)",
                                background: active
                                  ? "linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.12))"
                                  : "white",
                                boxShadow: active ? "0 12px 30px rgba(79,70,229,0.12)" : "none"
                              }}
                              onMouseEnter={(event) => {
                                event.currentTarget.style.transform = sessionActive ? "none" : "translateY(-3px)";
                              }}
                              onMouseLeave={(event) => {
                                event.currentTarget.style.transform = "translateY(0)";
                              }}
                            >
                              <span className="block text-sm font-extrabold text-slate-950">{item.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-slate-500">{item.blurb}</span>
                            </button>
                          );
                        })}
                      </Box>
                    </Paper>
                  </Box>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isUser = message.role === "user";

                      return (
                        <Box
                          key={`${message.role}-${index}`}
                          sx={{
                            display: "flex",
                            justifyContent: isUser ? "flex-end" : "flex-start",
                            mb: 2.5,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
                              maxWidth: { xs: "100%", md: "82%" },
                              flexDirection: isUser ? "row-reverse" : "row",
                              alignItems: "flex-end",
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor: isUser ? alpha("#4f46e5", 0.12) : alpha("#06b6d4", 0.12),
                                color: isUser ? "#4f46e5" : "#0e7490",
                              }}
                            >
                              {isUser ? "You" : <PsychologyRoundedIcon fontSize="small" />}
                            </Avatar>

                            <Paper
                              elevation={0}
                              sx={{
                                px: 2.4,
                                py: 1.7,
                                borderRadius: isUser
                                  ? "22px 22px 8px 22px"
                                  : "22px 22px 22px 8px",
                                bgcolor: isUser ? undefined : "#ffffff",
                                background: isUser ? "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" : undefined,
                                color: isUser ? "#ffffff" : "#111827",
                                border: `1px solid ${
                                  isUser ? alpha("#4f46e5", 0.18) : alpha("#4f46e5", 0.12)
                                }`,
                                boxShadow: `0 16px 36px ${alpha("#4f46e5", 0.12)}`,
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.8,
                              }}
                            >
                              {message.text}
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })}

                    {processing ? <ThinkingBubble /> : null}
                  </>
                )}

                <div ref={chatEndRef} />
              </Box>

              {!isQuizMode && (
              <Box
                className="border-t px-4 py-3 sm:px-5"
                sx={{ bgcolor: alpha("#ffffff", 0.92), borderColor: alpha("#4f46e5", 0.1) }}
              >
                <Box className="flex flex-wrap items-center gap-3">
                  <FormControl
                    size="small"
                    disabled={sessionActive}
                    sx={{
                      minWidth: { xs: "100%", sm: 210 },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 999,
                        bgcolor: "#ffffff",
                        color: "#111827",
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
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#4f46e5",
                      },
                    }}
                  >
                    <InputLabel id="mentor-mode-select-label">Mode</InputLabel>
                    <Select
                      labelId="mentor-mode-select-label"
                      value={mode}
                      label="Mode"
                      onChange={(event) => setMode(event.target.value)}
                    >
                      {MODES.map((item) => (
                        <MenuItem key={item.key} value={item.key}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {mode === "interview" ? (
                    <TextField
                      size="small"
                      value={interviewTopic}
                      onChange={(event) => setInterviewTopic(event.target.value)}
                      disabled={sessionActive}
                      placeholder="Interview topic e.g. Java"
                      sx={{
                        minWidth: { xs: "100%", sm: 260 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 999,
                          bgcolor: "#ffffff",
                          color: "#111827",
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
                  ) : null}

                    <>
                      <Button
                        variant="contained"
                        onClick={startSession}
                        disabled={sessionActive}
                        startIcon={<GraphicEqRoundedIcon />}
                        sx={{
                          borderRadius: 999,
                          px: 2.8,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                          color: "#ffffff",
                        }}
                      >
                        {sessionActive ? "Session Running" : "Start Session"}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={stopQuestion}
                        startIcon={<MicOffRoundedIcon />}
                        sx={{
                          borderRadius: 999,
                          px: 2.6,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#a85c00",
                          borderColor: alpha("#f59e0b", 0.28),
                          bgcolor: alpha("#f59e0b", 0.08),
                        }}
                      >
                        Stop Response
                      </Button>

                      <IconButton
                        onClick={() => endSession()}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 999,
                          bgcolor: alpha("#ef4444", 0.14),
                          color: "#fecaca",
                          border: `1px solid ${alpha("#ef4444", 0.2)}`,
                        }}
                      >
                        <StopCircleRoundedIcon />
                      </IconButton>

                      <Typography sx={{ color: "#64748b", fontSize: 13 }}>
                        A {BREATH_PAUSE_MS / 1000}s pause is treated as a natural breath, and{" "}
                        {SEND_PAUSE_MS / 1000}s sends the message.
                      </Typography>
                    </>
                </Box>
              </Box>
              )}
            </Box>

          </Box>
        </Box>

        <Box
          className="no-scrollbar hidden min-h-0 overflow-y-auto border-l p-4 xl:block"
          sx={{
            bgcolor: alpha("#eef2ff", 0.55),
            borderColor: alpha("#4f46e5", 0.1),
          }}
        >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: alpha("#ffffff", 0.96),
                  border: `1px solid ${alpha("#4f46e5", 0.1)}`,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 4,
                    border: `1px solid ${alpha("#4f46e5", 0.14)}`,
                    boxShadow: `0 18px 40px ${alpha("#4f46e5", 0.16)}`,
                  }}
                >
                  <img
                    src="/models/mentor.jpg"
                    alt="Dummi X AI Mentor"
                    style={{ width: "100%", height: "212px", objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(2,6,23,0.04) 0%, rgba(2,6,23,0.72) 100%)",
                    }}
                  />
                  <Box sx={{ position: "absolute", left: 16, bottom: 16 }}>
                    <Typography sx={{ color: "#f8fafc", fontSize: 22, fontWeight: 800 }}>
                      Dummi X
                    </Typography>
                    <Typography sx={{ color: "rgba(226,232,240,0.8)", fontSize: 13 }}>
                      Adaptive AI mentor and spoken guidance companion
                    </Typography>
                  </Box>
                </Box>

                <Stack spacing={1.5} sx={{ mt: 2.5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      bgcolor: alpha("#eef2ff", 0.55),
                      color: "#475569",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                      Live Session State
                    </Typography>
                    <Typography sx={{ mt: 0.75, lineHeight: 1.7 }}>
                      {isQuizMode
                        ? "Quiz mode is ready. Navigate through the questions and submit whenever you finish."
                        : sessionActive
                        ? "The mentor session is active and waiting for spoken interaction."
                        : "Dummi X is on standby. Start the session to enable voice guidance."}
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      bgcolor: alpha("#eef2ff", 0.55),
                      color: "#475569",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: "#111827" }}>
                      Best Practice
                    </Typography>
                    <Typography sx={{ mt: 0.75, lineHeight: 1.7 }}>
                      {isQuizMode
                        ? "Attempt every question first, then revisit the grid before you submit so you can maximize your final score."
                        : "Keep answers clear and spoken in one thought. Dummi X responds best when each question or answer has a natural pause."}
                    </Typography>
                  </Paper>

                  <Chip
                    icon={<TaskAltRoundedIcon />}
                    label={isQuizMode ? "Timed quiz mode" : `${messages.length} conversation moments`}
                    sx={{
                      alignSelf: "flex-start",
                      borderRadius: 999,
                      bgcolor: alpha("#06b6d4", 0.1),
                      color: "#0e7490",
                    }}
                  />
                </Stack>
              </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AIMentor;
