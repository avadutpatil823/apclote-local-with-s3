import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { submitTest } from "../../State/lecutrersState/Action";
import { SyncLoader } from "react-spinners";

const OPTION_KEYS = ["opt-1", "opt-2", "opt-3", "opt-4"];

const UserAnswers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { test } = location.state || {};
  const dispatch = useDispatch();
  const { lecturerWork } = useSelector((store) => store);

  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const questions = test?.questions || [];
  const currentQuestion = questions[currentIndex];
  const attemptedCount = questions.filter((question) => Boolean(answers[question.id])).length;

  const handleChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    const userAnswers = test.questions.map((q) => answers[q.id] || "");
    const success = await dispatch(submitTest(test.id, userAnswers));
    if (success) {
      navigate(-2);
    }
  };

  if (!test || !questions.length) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="content-card empty-card mx-auto">
            <h2 className="title-dark text-2xl">Quiz not available</h2>
            <p className="subtle-text mt-4">
              We could not find the test details for this attempt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)] p-4 shadow-[0_28px_80px_rgba(15,23,42,0.32)] md:p-5">
          <div className="flex min-h-[calc(100vh-220px)] flex-col gap-4 lg:flex-row">
            <aside className="w-full shrink-0 rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.78)] p-5 lg:w-[250px]">
              <span className="eyebrow !border-[#1d4ed8] !bg-[rgba(59,130,246,0.16)] !text-sky-100">
                Quiz Map
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white">{test.name}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Open any question from the grid, answer one option, and submit when you finish the
                full quiz.
              </p>

              <div className="mt-5 grid grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const isActive = index === currentIndex;
                  const isAnswered = Boolean(answers[question.id]);

                  return (
                    <button
                      key={question.id || index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-2xl border px-0 py-3 text-sm font-bold transition ${
                        isActive
                          ? "border-cyan-300 bg-cyan-400/20 text-cyan-50"
                          : isAnswered
                            ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                            : "border-white/10 bg-white/4 text-slate-200 hover:border-cyan-300/30 hover:bg-cyan-400/10"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-cyan-400/16 bg-cyan-400/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
                    Attempted
                  </p>
                  <p className="mt-2 text-3xl font-bold text-cyan-50">
                    {attemptedCount}/{questions.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                  Use <span className="font-semibold text-white">Previous</span> and{" "}
                  <span className="font-semibold text-white">Next</span> to move through the quiz,
                  or jump directly using the number grid.
                </div>
              </div>
            </aside>

            <section className="flex-1 rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.82)] p-5 md:p-7">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="eyebrow !border-[#155e75] !bg-[rgba(6,182,212,0.12)] !text-cyan-100">
                    Question {currentIndex + 1}
                  </span>
                  <h1 className="mt-4 text-3xl font-bold text-white">
                    Choose the best answer
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    Select one option for the current question. You can revise answers anytime
                    before you submit the test.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Progress
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {Math.round((attemptedCount / questions.length) * 100)}%
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
                    const isSelected = answers[currentQuestion.id] === optionKey;

                    return (
                      <button
                        key={optionKey}
                        type="button"
                        onClick={() => handleChange(currentQuestion.id, optionKey)}
                        className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left transition md:px-5 ${
                          isSelected
                            ? "border-cyan-300 bg-cyan-400/16 text-cyan-50"
                            : "border-white/10 bg-white/4 text-slate-200 hover:border-cyan-300/28 hover:bg-cyan-400/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-sm font-bold text-white">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-base font-medium leading-7">{optionText}</span>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border ${
                            isSelected ? "border-cyan-200 bg-cyan-200" : "border-slate-500"
                          }`}
                        />
                      </button>
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

                <button onClick={handleSubmit} disabled={lecturerWork?.isloading} className="primary-btn disabled:cursor-not-allowed disabled:opacity-70">
                  <span className="flex items-center justify-center gap-3">
                    {lecturerWork?.isloading ? <SyncLoader color="white" size={8} /> : null}
                    <span>{lecturerWork?.isloading ? "Submitting Test..." : "Submit Test"}</span>
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnswers;
