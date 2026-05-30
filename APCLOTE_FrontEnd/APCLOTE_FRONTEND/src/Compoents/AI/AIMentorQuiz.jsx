import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { buildApiUrl } from "../../config/api";

const QUIZ_API_URL = buildApiUrl("/mentor");
const QUIZ_OPTION_KEYS = ["opt-1", "opt-2", "opt-3", "opt-4"];
const QUIZ_TIME_PER_QUESTION_SECONDS = 90;
const DEFAULT_QUESTION_COUNT = 5;
const MIN_QUESTION_COUNT = 1;
const MAX_QUESTION_COUNT = 15;

const FALLBACK_QUESTION_BANK = [
  {
    questionText: "Which statement best describes the main purpose of this topic?",
    opt1: "It focuses only on UI colors",
    opt2: "It defines a core concept and how it is used",
    opt3: "It is only relevant to databases",
    opt4: "It replaces all programming languages",
    keyAnswer: "opt-2",
  },
  {
    questionText: "What is usually the biggest benefit of understanding this topic well?",
    opt1: "Writing clearer and more reliable solutions",
    opt2: "Avoiding every kind of debugging forever",
    opt3: "Removing the need for testing",
    opt4: "Making code run without any environment",
    keyAnswer: "opt-1",
  },
  {
    questionText: "Which approach is best when learning this topic deeply?",
    opt1: "Memorize random words only",
    opt2: "Ignore examples and practice",
    opt3: "Learn the concept, then apply it in examples",
    opt4: "Skip the fundamentals",
    keyAnswer: "opt-3",
  },
  {
    questionText: "How should you usually apply this topic in real projects?",
    opt1: "Only copy code without understanding",
    opt2: "Use it where it solves the actual problem",
    opt3: "Add it to every file by default",
    opt4: "Avoid it completely",
    keyAnswer: "opt-2",
  },
  {
    questionText: "Which habit helps most when revising this topic before an interview or test?",
    opt1: "Practice explaining it in simple words",
    opt2: "Read only the title",
    opt3: "Skip all edge cases",
    opt4: "Avoid all questions about it",
    keyAnswer: "opt-1",
  },
  {
    questionText: "What is the strongest sign that you truly understand this topic?",
    opt1: "You can apply it and explain why it works",
    opt2: "You only remember one definition",
    opt3: "You never need examples",
    opt4: "You avoid using it in practice",
    keyAnswer: "opt-1",
  },
  {
    questionText: "When solving a problem in this topic, what should you do first?",
    opt1: "Guess the answer immediately",
    opt2: "Understand the requirement and constraints",
    opt3: "Write the final code without planning",
    opt4: "Skip input and output expectations",
    keyAnswer: "opt-2",
  },
  {
    questionText: "Why are worked examples useful for this topic?",
    opt1: "They replace all theory permanently",
    opt2: "They show how the concept behaves step by step",
    opt3: "They make mistakes impossible",
    opt4: "They remove the need for revision",
    keyAnswer: "opt-2",
  },
];

const normalizeQuestions = (questions) =>
  (Array.isArray(questions) ? questions : [])
    .filter((question) => question && typeof question === "object")
    .map((question, index) => ({
      id: question.id || `mentor-quiz-${index + 1}`,
      questionText: question.questionText || `Question ${index + 1}`,
      opt1: question.opt1 || "",
      opt2: question.opt2 || "",
      opt3: question.opt3 || "",
      opt4: question.opt4 || "",
      keyAnswer: QUIZ_OPTION_KEYS.includes(question.keyAnswer) ? question.keyAnswer : "opt-1",
    }))
    .filter(
      (question) =>
        question.questionText &&
        question.opt1 &&
        question.opt2 &&
        question.opt3 &&
        question.opt4
    );

const evaluateAnswers = (questions, answers) => {
  const attempted = questions.filter((question) => Boolean(answers[question.id])).length;
  const correct = questions.filter(
    (question) => answers[question.id] && answers[question.id] === question.keyAnswer
  ).length;
  const wrong = attempted - correct;

  return {
    total: questions.length,
    attempted,
    correct,
    wrong,
    skipped: questions.length - attempted,
    score: questions.length ? Math.round((correct / questions.length) * 100) : 0,
  };
};

const getGridTone = ({ submitted, isCurrent, isAnswered, isCorrect, isWrong }) => {
  if (submitted && isCorrect) {
    return {
      bg: alpha("#22c55e", 0.12),
      border: alpha("#22c55e", 0.38),
      color: "#15803d",
    };
  }

  if (submitted && isWrong) {
    return {
      bg: alpha("#ef4444", 0.1),
      border: alpha("#ef4444", 0.34),
      color: "#b91c1c",
    };
  }

  if (isCurrent) {
    return {
      bg: alpha("#4f46e5", 0.1),
      border: alpha("#4f46e5", 0.42),
      color: "#4338ca",
    };
  }

  if (isAnswered) {
    return {
      bg: alpha("#06b6d4", 0.1),
      border: alpha("#06b6d4", 0.24),
      color: "#0e7490",
    };
  }

  return {
    bg: "#ffffff",
    border: alpha("#4f46e5", 0.12),
    color: "#475569",
  };
};

const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const clampQuestionCount = (value) => {
  const numeric = Number.parseInt(value, 10);

  if (Number.isNaN(numeric)) return DEFAULT_QUESTION_COUNT;

  return Math.min(MAX_QUESTION_COUNT, Math.max(MIN_QUESTION_COUNT, numeric));
};

const extractJsonPayload = (value) => {
  if (!value) return null;

  const cleaned = String(value)
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return null;
  }
};

const buildQuizPrompt = (topic, questionCount) =>
  `Create exactly ${questionCount} multiple choice quiz questions on the topic "${topic}". Return ONLY valid JSON with this exact shape: {"title":"string","questions":[{"questionText":"string","opt1":"string","opt2":"string","opt3":"string","opt4":"string","keyAnswer":"opt-1"}]}. The questions must be concise, practical, and not repeated. The keyAnswer must always be one of: opt-1, opt-2, opt-3, opt-4. Do not include markdown, notes, or explanation outside JSON.`;

const buildFallbackQuestions = (topic, questionCount) =>
  Array.from({ length: questionCount }, (_, index) => {
    const template = FALLBACK_QUESTION_BANK[index % FALLBACK_QUESTION_BANK.length];

    return {
      id: `fallback-${index + 1}`,
      questionText: `${topic}: ${template.questionText}`,
      opt1: template.opt1,
      opt2: template.opt2,
      opt3: template.opt3,
      opt4: template.opt4,
      keyAnswer: template.keyAnswer,
    };
  });

const AIMentorQuiz = () => {
  const [quizTopic, setQuizTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [quizTitle, setQuizTitle] = useState("Dummi X Quiz Challenge");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [didAutoSubmit, setDidAutoSubmit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const quizContainerRef = useRef(null);

  const totalSeconds = quizQuestions.length * QUIZ_TIME_PER_QUESTION_SECONDS;
  const result = useMemo(() => evaluateAnswers(quizQuestions, answers), [answers, quizQuestions]);
  const currentQuestion = quizQuestions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] || "" : "";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === quizContainerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!quizStarted || submitted || !remainingSeconds) return undefined;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [quizStarted, submitted, remainingSeconds]);

  useEffect(() => {
    if (!quizStarted || submitted || remainingSeconds !== 0) return;

    setSubmitted(true);
    setDidAutoSubmit(true);
  }, [quizStarted, submitted, remainingSeconds]);

  const handleSelectAnswer = (optionKey) => {
    if (submitted || !currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setDidAutoSubmit(false);
  };

  const resetCurrentQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
    setDidAutoSubmit(false);
    setRemainingSeconds(totalSeconds);
  };

  const openQuizSetup = () => {
    setQuizStarted(false);
    setSubmitted(false);
    setQuizQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setRemainingSeconds(0);
    setDidAutoSubmit(false);
    setQuizError("");
  };

  const toggleFullscreen = async () => {
    const container = quizContainerRef.current;

    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
        return;
      }

      await container.requestFullscreen();
    } catch (error) {
    }
  };

  const generateQuiz = async () => {
    const normalizedTopic = quizTopic.trim();
    const normalizedCount = clampQuestionCount(questionCount);

    if (!normalizedTopic) {
      setQuizError("Please enter a quiz topic before starting.");
      return;
    }

    setQuizLoading(true);
    setQuizError("");

    try {
      const response = await fetch(QUIZ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`,
        },
        body: JSON.stringify({
          input: buildQuizPrompt(normalizedTopic, normalizedCount),
          mode: "quiz",
        }),
      });

      const data = await response.json();
      const parsedPayload =
        (Array.isArray(data?.questions)
          ? { title: data?.title, questions: data.questions }
          : extractJsonPayload(data?.reply)) || {};

      const normalizedQuestions = normalizeQuestions(parsedPayload.questions);
      const finalQuestions = normalizedQuestions.length
        ? normalizedQuestions.slice(0, normalizedCount)
        : buildFallbackQuestions(normalizedTopic, normalizedCount);

      setQuizTitle(parsedPayload.title || `${normalizedTopic} Quiz Challenge`);
      setQuizQuestions(finalQuestions);
      setQuizStarted(true);
      setSubmitted(false);
      setAnswers({});
      setCurrentIndex(0);
      setDidAutoSubmit(false);
      setRemainingSeconds(finalQuestions.length * QUIZ_TIME_PER_QUESTION_SECONDS);
    } catch (error) {

      const fallbackQuestions = buildFallbackQuestions(normalizedTopic, normalizedCount);

      setQuizTitle(`${normalizedTopic} Quiz Challenge`);
      setQuizQuestions(fallbackQuestions);
      setQuizStarted(true);
      setSubmitted(false);
      setAnswers({});
      setCurrentIndex(0);
      setDidAutoSubmit(false);
      setRemainingSeconds(fallbackQuestions.length * QUIZ_TIME_PER_QUESTION_SECONDS);
      setQuizError(
        "Live quiz generation was not available, so a local practice quiz was prepared for this topic."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  if (!quizStarted) {
    const configuredQuestionCount = clampQuestionCount(questionCount);
    const configuredTotalSeconds = configuredQuestionCount * QUIZ_TIME_PER_QUESTION_SECONDS;

    return (
      <Box className="flex min-h-full items-start justify-center py-6">
        <Paper
          elevation={0}
          className="ai-card-pop w-full rounded-[22px] border px-5 py-6 md:px-7 md:py-8"
          sx={{
            bgcolor: alpha("#ffffff", 0.98),
            borderColor: alpha("#4f46e5", 0.12),
            boxShadow: `0 24px 64px ${alpha("#4f46e5", 0.13)}`,
          }}
        >
          <Box className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Chip
                  icon={<QuizRoundedIcon />}
                  label="Interactive Quiz Mode"
                  sx={{
                    bgcolor: alpha("#4f46e5", 0.1),
                    color: "#4338ca",
                    borderRadius: 999,
                  }}
                />
              </Stack>

              <Typography sx={{ mt: 2.2, color: "#111827", fontSize: 32, fontWeight: 800 }}>
                Start a timed quiz with Dummi X
              </Typography>
              <Typography sx={{ mt: 1.5, color: "#64748b", lineHeight: 1.85 }}>
                Choose a topic, pick how many questions you want, and Dummi X will prepare a
                quiz. Each question gets 1.5 minutes, but you can spend that time freely across the
                full quiz. The total countdown is based on question count multiplied by 1.5 minutes.
              </Typography>

              <Box className="mt-5 grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Quiz Topic"
                  value={quizTopic}
                  onChange={(event) => setQuizTopic(event.target.value)}
                  placeholder="e.g. Spring Boot, Java, React"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#ffffff",
                      color: "#111827",
                      boxShadow: `0 12px 30px ${alpha("#4f46e5", 0.08)}`,
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
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(71,85,105,0.62)",
                      opacity: 1,
                    },
                  }}
                />

                <TextField
                  label="Number of Questions"
                  type="number"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(clampQuestionCount(event.target.value))}
                  inputProps={{ min: MIN_QUESTION_COUNT, max: MAX_QUESTION_COUNT }}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#ffffff",
                      color: "#111827",
                      boxShadow: `0 12px 30px ${alpha("#4f46e5", 0.08)}`,
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
                  }}
                />
              </Box>

              {quizError ? (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    px: 2,
                    py: 1.4,
                    borderRadius: 3,
                    bgcolor: alpha("#ef4444", 0.12),
                    color: "#b91c1c",
                    border: `1px solid ${alpha("#ef4444", 0.2)}`,
                  }}
                >
                  {quizError}
                </Paper>
              ) : null}

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={generateQuiz}
                  disabled={quizLoading}
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                    color: "#ffffff",
                    boxShadow: `0 16px 34px ${alpha("#4f46e5", 0.22)}`,
                  }}
                >
                  {quizLoading ? "Preparing Quiz..." : "Start Quiz"}
                </Button>

                <Chip
                  icon={<AccessTimeRoundedIcon />}
                  label={`${configuredQuestionCount} questions • ${formatDuration(configuredTotalSeconds)} total`}
                  sx={{
                    height: 44,
                    borderRadius: 999,
                    bgcolor: alpha("#06b6d4", 0.1),
                    color: "#0e7490",
                    border: `1px solid ${alpha("#06b6d4", 0.18)}`,
                  }}
                />
              </Stack>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: alpha("#eef2ff", 0.55),
                border: `1px solid ${alpha("#4f46e5", 0.1)}`,
              }}
            >
              <Typography sx={{ color: "#111827", fontSize: 18, fontWeight: 800 }}>
                Quiz Rules
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 2.4 }}>
                {[
                  "Enter a topic before starting the quiz.",
                  "Set how many questions you want in this round.",
                  "Each question is worth 1.5 minutes in the total timer.",
                  "The quiz auto-submits when the total countdown reaches zero.",
                  "Use fullscreen for a more focused quiz attempt.",
                ].map((item) => (
                  <Paper
                    key={item}
                    elevation={0}
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      bgcolor: "#ffffff",
                      color: "#475569",
                      border: `1px solid ${alpha("#4f46e5", 0.1)}`,
                      boxShadow: `0 10px 26px ${alpha("#4f46e5", 0.06)}`,
                    }}
                  >
                    {item}
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Paper>
      </Box>
    );
  }

  const isLastQuestion = currentIndex === quizQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  return (
    <Box ref={quizContainerRef} className="h-full">
      <Box className="mx-auto flex h-full w-full flex-col gap-4 lg:flex-row">
        <Paper
          elevation={0}
          className="ai-card-pop w-full shrink-0 lg:w-[250px]"
          sx={{
            p: 2.2,
            borderRadius: 4,
            bgcolor: alpha("#ffffff", 0.98),
            border: `1px solid ${alpha("#4f46e5", 0.12)}`,
            boxShadow: `0 18px 42px ${alpha("#4f46e5", 0.1)}`,
          }}
        >
          <Typography sx={{ color: "#111827", fontSize: 18, fontWeight: 800 }}>
            Quiz Map
          </Typography>
          <Typography sx={{ mt: 0.8, color: "#64748b", lineHeight: 1.7 }}>
            Move between questions anytime. The full timer covers the entire quiz, not each
            question separately.
          </Typography>

          <Box
            sx={{
              mt: 2.2,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(52px, 1fr))",
              gap: 1.2,
            }}
          >
            {quizQuestions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isAnswered = Boolean(userAnswer);
              const isCorrect = submitted && userAnswer === question.keyAnswer;
              const isWrong = submitted && isAnswered && userAnswer !== question.keyAnswer;
              const tone = getGridTone({
                submitted,
                isCurrent: index === currentIndex,
                isAnswered,
                isCorrect,
                isWrong,
              });

              return (
                <Button
                  key={question.id}
                  onClick={() => setCurrentIndex(index)}
                  variant="outlined"
                  sx={{
                    minWidth: 0,
                    py: 1.3,
                    borderRadius: 3,
                    fontWeight: 800,
                    color: tone.color,
                    borderColor: tone.border,
                    bgcolor: tone.bg,
                  }}
                >
                  {index + 1}
                </Button>
              );
            })}
          </Box>

          <Stack spacing={1.2} sx={{ mt: 2.2 }}>
            <Chip
              icon={<AccessTimeRoundedIcon />}
              label={`${formatDuration(remainingSeconds)} left`}
              sx={{
                justifyContent: "flex-start",
                bgcolor: alpha("#f59e0b", 0.12),
                color: "#a85c00",
                borderRadius: 999,
              }}
            />
            <Chip
              icon={<HelpOutlineRoundedIcon />}
              label={`${result.attempted}/${result.total} attempted`}
              sx={{
                justifyContent: "flex-start",
                bgcolor: alpha("#38bdf8", 0.12),
                color: "#0e7490",
                borderRadius: 999,
              }}
            />
            {submitted ? (
              <Chip
                icon={<TrendingUpRoundedIcon />}
                label={`${result.score}% score`}
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: alpha("#22c55e", 0.14),
                  color: "#15803d",
                  borderRadius: 999,
                }}
              />
            ) : null}
          </Stack>

          <Stack spacing={1.2} sx={{ mt: 2.2 }}>
            <Button
              variant="outlined"
              onClick={toggleFullscreen}
              startIcon={isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "#4f46e5",
                borderColor: alpha("#4f46e5", 0.2),
              }}
            >
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </Button>

            <Button
              variant="outlined"
              onClick={openQuizSetup}
              startIcon={<RestartAltRoundedIcon />}
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "#0e7490",
                borderColor: alpha("#06b6d4", 0.24),
              }}
            >
              New Quiz Setup
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          className="ai-card-pop min-h-0 flex-1"
          sx={{
            p: { xs: 2.4, md: 3 },
            borderRadius: 4,
            bgcolor: alpha("#ffffff", 0.98),
            border: `1px solid ${alpha("#4f46e5", 0.12)}`,
            boxShadow: `0 24px 56px ${alpha("#4f46e5", 0.12)}`,
          }}
        >
          <Box className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between" sx={{ borderColor: alpha("#4f46e5", 0.1) }}>
            <Box>
              <Typography sx={{ color: "#111827", fontSize: 28, fontWeight: 800 }}>
                {quizTitle}
              </Typography>
              <Typography sx={{ mt: 1, color: "#64748b", lineHeight: 1.75 }}>
                Topic: {quizTopic.trim()} | Total time: {formatDuration(totalSeconds)} | You can
                use more than 1.5 minutes on one question as long as you stay within the full quiz
                countdown.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<HelpOutlineRoundedIcon />}
                label={`Question ${currentIndex + 1} of ${quizQuestions.length}`}
                sx={{
                  bgcolor: alpha("#4f46e5", 0.1),
                  color: "#4338ca",
                  borderRadius: 999,
                }}
              />
              <Chip
                icon={<AccessTimeRoundedIcon />}
                label={formatDuration(remainingSeconds)}
                sx={{
                  bgcolor: alpha("#f59e0b", 0.14),
                  color: "#a85c00",
                  borderRadius: 999,
                }}
              />
              {submitted ? (
                <Chip
                  icon={<CheckCircleRoundedIcon />}
                  label={`${result.correct} correct`}
                  sx={{
                  bgcolor: alpha("#22c55e", 0.14),
                    color: "#15803d",
                    borderRadius: 999,
                  }}
                />
              ) : null}
            </Stack>
          </Box>

          {quizError ? (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                px: 2,
                py: 1.35,
                borderRadius: 3,
                bgcolor: alpha(didAutoSubmit ? "#f59e0b" : "#38bdf8", 0.12),
                color: didAutoSubmit ? "#a85c00" : "#0e7490",
                border: `1px solid ${alpha(didAutoSubmit ? "#f59e0b" : "#38bdf8", 0.22)}`,
              }}
            >
              {quizError}
            </Paper>
          ) : null}

          {didAutoSubmit ? (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                px: 2,
                py: 1.35,
                borderRadius: 3,
                bgcolor: alpha("#f59e0b", 0.12),
                color: "#a85c00",
                border: `1px solid ${alpha("#f59e0b", 0.22)}`,
              }}
            >
              Time is up, so the quiz was submitted automatically.
            </Paper>
          ) : null}

          {submitted ? (
            <Box className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Attempted", value: result.attempted, color: "#0e7490", bg: "#0ea5e9" },
                { label: "Correct", value: result.correct, color: "#15803d", bg: "#22c55e" },
                { label: "Wrong", value: result.wrong, color: "#b91c1c", bg: "#ef4444" },
                { label: "Skipped", value: result.skipped, color: "#a85c00", bg: "#f59e0b" },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(item.bg, 0.08),
                    border: `1px solid ${alpha(item.bg, 0.16)}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.1,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography sx={{ mt: 1, color: item.color, fontSize: 28, fontWeight: 800 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : null}

          {currentQuestion ? (
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: { xs: 2.2, md: 2.8 },
                borderRadius: 4,
                bgcolor: alpha("#eef2ff", 0.55),
                border: `1px solid ${alpha("#4f46e5", 0.1)}`,
              }}
            >
              <Typography
                sx={{
                  color: "#4f46e5",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                }}
              >
                QUESTION {currentIndex + 1}
              </Typography>
              <Typography
                sx={{
                  mt: 1.4,
                  color: "#111827",
                  fontSize: { xs: 22, md: 28 },
                  fontWeight: 800,
                  lineHeight: 1.45,
                }}
              >
                {currentQuestion.questionText}
              </Typography>

              <Stack spacing={1.8} sx={{ mt: 3 }}>
                {QUIZ_OPTION_KEYS.map((optionKey, index) => {
                  const optionText = currentQuestion[`opt${index + 1}`];
                  const isSelected = selectedAnswer === optionKey;
                  const isCorrect = submitted && currentQuestion.keyAnswer === optionKey;
                  const isWrongSelection =
                    submitted && isSelected && currentQuestion.keyAnswer !== optionKey;

                  let optionBg = "#ffffff";
                  let optionBorder = alpha("#4f46e5", 0.12);
                  let optionTextColor = "#334155";

                  if (isSelected && !submitted) {
                    optionBg = alpha("#4f46e5", 0.1);
                    optionBorder = alpha("#4f46e5", 0.34);
                    optionTextColor = "#4338ca";
                  }

                  if (isCorrect) {
                    optionBg = alpha("#22c55e", 0.16);
                    optionBorder = alpha("#22c55e", 0.34);
                    optionTextColor = "#15803d";
                  }

                  if (isWrongSelection) {
                    optionBg = alpha("#ef4444", 0.16);
                    optionBorder = alpha("#ef4444", 0.34);
                    optionTextColor = "#b91c1c";
                  }

                  return (
                    <Button
                      key={optionKey}
                      onClick={() => handleSelectAnswer(optionKey)}
                      disabled={submitted}
                      variant="outlined"
                      sx={{
                        justifyContent: "space-between",
                        textTransform: "none",
                        px: 2,
                        py: 1.9,
                        borderRadius: 3,
                        borderColor: optionBorder,
                        bgcolor: optionBg,
                        color: optionTextColor,
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? `0 12px 30px ${alpha("#4f46e5", 0.12)}` : "none",
                        "&:hover": {
                          bgcolor: submitted ? optionBg : alpha("#06b6d4", 0.08),
                          transform: submitted ? "none" : "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5, textAlign: "left" }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "12px",
                            bgcolor: alpha("#4f46e5", 0.1),
                            fontWeight: 800,
                          }}
                        >
                          {String.fromCharCode(65 + index)}
                        </Box>
                        <Typography sx={{ fontWeight: 700, lineHeight: 1.6 }}>
                          {optionText}
                        </Typography>
                      </Box>

                      {submitted && isCorrect ? (
                        <Typography sx={{ color: "#15803d", fontWeight: 800 }}>Correct</Typography>
                      ) : null}
                      {submitted && isWrongSelection ? (
                        <Typography sx={{ color: "#b91c1c", fontWeight: 800 }}>Your pick</Typography>
                      ) : null}
                    </Button>
                  );
                })}
              </Stack>

              <Box className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between" sx={{ borderColor: alpha("#4f46e5", 0.1) }}>
                <Box className="flex flex-wrap gap-3">
                  <Button
                    variant="outlined"
                    disabled={isFirstQuestion}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    sx={{
                      borderRadius: 999,
                      px: 2.6,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#4f46e5",
                      borderColor: alpha("#4f46e5", 0.2),
                    }}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outlined"
                    disabled={isLastQuestion}
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    sx={{
                      borderRadius: 999,
                      px: 2.6,
                      py: 1.1,
                      textTransform: "none",
                      fontWeight: 700,
                      color: "#4f46e5",
                      borderColor: alpha("#4f46e5", 0.2),
                    }}
                  >
                    Next
                  </Button>
                </Box>

                <Box className="flex flex-wrap gap-3">
                  {submitted ? (
                    <Button
                      variant="outlined"
                      onClick={resetCurrentQuiz}
                      startIcon={<RestartAltRoundedIcon />}
                      sx={{
                        borderRadius: 999,
                        px: 2.6,
                        py: 1.1,
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#0e7490",
                        borderColor: alpha("#06b6d4", 0.28),
                      }}
                    >
                      Try Again
                    </Button>
                  ) : null}

                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitted}
                    sx={{
                      borderRadius: 999,
                      px: 2.9,
                      py: 1.15,
                      textTransform: "none",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
                      color: "#ffffff",
                    }}
                  >
                    {submitted ? "Submitted" : "Submit Quiz"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : null}
        </Paper>
      </Box>
    </Box>
  );
};

export default AIMentorQuiz;
