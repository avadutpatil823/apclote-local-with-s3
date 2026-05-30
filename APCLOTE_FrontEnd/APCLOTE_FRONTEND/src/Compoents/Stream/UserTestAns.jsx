import React, { useState } from "react";
import { useSelector } from "react-redux";

const OPTION_KEYS = ["opt-1", "opt-2", "opt-3", "opt-4"];

const UserTestAns = () => {
  const { lecturerWork } = useSelector((store) => store);
  const userTest = lecturerWork.userTestAnswer;
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!userTest?.test) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="content-card empty-card mx-auto">
            <h2 className="title-dark text-2xl">Result not available</h2>
            <p className="subtle-text mt-4">
              We could not find the submitted quiz result for review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { test, userAnswers, correctAns, wrongAns } = userTest;
  const questions = test.questions || [];
  const total = questions.length;
  const attempted = (userAnswers || []).filter(Boolean).length;
  const skipped = total - attempted;
  const currentQuestion = questions[currentIndex];
  const currentUserAnswer = userAnswers?.[currentIndex] || "";

  const getQuestionState = (index) => {
    const question = questions[index];
    const selectedAnswer = userAnswers?.[index] || "";

    if (!selectedAnswer) return "skipped";
    if (selectedAnswer === question.keyAnswer) return "correct";
    return "wrong";
  };

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] p-4 shadow-[0_28px_80px_rgba(15,23,42,0.32)] md:p-5">
          <div className="flex min-h-[calc(100vh-220px)] flex-col gap-4 lg:flex-row">
            <aside className="w-full shrink-0 rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.78)] p-5 lg:w-[250px]">
              <span className="eyebrow !border-[#16a34a] !bg-[rgba(34,197,94,0.16)] !text-emerald-100">
                Quiz Result
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">{test.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Open any question number to review the correct answer and compare it with your
                selected option.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const state = getQuestionState(index);
                  const isActive = index === currentIndex;

                  const toneClass =
                    state === "correct"
                      ? "border-emerald-300/35 bg-emerald-400/16 text-emerald-100"
                      : state === "wrong"
                        ? "border-rose-300/35 bg-rose-400/16 text-rose-100"
                        : "border-amber-300/30 bg-amber-400/14 text-amber-100";

                  return (
                    <button
                      key={question.id || index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-2xl border px-0 py-3 text-sm font-bold transition ${
                        isActive ? "ring-2 ring-cyan-300/55" : ""
                      } ${toneClass}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-cyan-400/16 bg-cyan-400/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
                      Attempted
                    </p>
                    <p className="mt-2 text-3xl font-bold text-cyan-50">{attempted}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/16 bg-emerald-400/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/75">
                      Correct
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-50">{correctAns}</p>
                  </div>
                  <div className="rounded-2xl border border-rose-400/16 bg-rose-400/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-100/75">
                      Wrong
                    </p>
                    <p className="mt-2 text-3xl font-bold text-rose-50">{wrongAns}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-400/16 bg-amber-400/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/75">
                      Skipped
                    </p>
                    <p className="mt-2 text-3xl font-bold text-amber-50">{skipped}</p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex-1 rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.82)] p-5 md:p-7">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="eyebrow !border-[#155e75] !bg-[rgba(6,182,212,0.12)] !text-cyan-100">
                    Review Question {currentIndex + 1}
                  </span>
                  <h1 className="mt-4 text-3xl font-bold text-white">Answer Analysis</h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    Green shows the correct answer. If your selected answer was wrong, that option
                    is highlighted in red.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Score
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {total ? Math.round((correctAns / total) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-[rgba(2,6,23,0.44)] p-5 md:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
                  Question Prompt
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-10 text-white md:text-3xl">
                  {currentQuestion.questionText}
                </h2>

                <div className="mt-6 space-y-3">
                  {OPTION_KEYS.map((optionKey, index) => {
                    const optionText = currentQuestion[`opt${index + 1}`];
                    const isUser = optionKey === currentUserAnswer;
                    const isCorrect = optionKey === currentQuestion.keyAnswer;
                    const isWrongSelection = isUser && !isCorrect;

                    const toneClass = isCorrect
                      ? "border-emerald-300/35 bg-emerald-400/16 text-emerald-50"
                      : isWrongSelection
                        ? "border-rose-300/35 bg-rose-400/16 text-rose-50"
                        : "border-white/10 bg-white/4 text-slate-200";

                    return (
                      <div
                        key={optionKey}
                        className={`flex items-center justify-between rounded-[22px] border px-4 py-4 md:px-5 ${toneClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-bold text-white">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-base font-medium leading-7">{optionText}</span>
                        </div>

                        <div className="text-right text-sm font-semibold">
                          {isCorrect ? (
                            <span className="text-emerald-100">Correct Answer</span>
                          ) : null}
                          {isWrongSelection ? (
                            <span className="text-rose-100">Your Answer</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="ghost-btn disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
                    }
                    disabled={currentIndex === questions.length - 1}
                    className="ghost-btn disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
                  Question {currentIndex + 1} of {questions.length}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTestAns;
