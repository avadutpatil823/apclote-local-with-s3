import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createTest } from "../../State/lecutrersState/Action";
import { getLecturerBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { SyncLoader } from "react-spinners";
import LinearProgress from "@mui/material/LinearProgress";

const CreateTest = () => {
  const location = useLocation();
  const { batchId, classRoomId, classId } = location.state || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lecturerWork } = useSelector((store) => store);
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      opt1: "",
      opt2: "",
      opt3: "",
      opt4: "",
      keyAnswer: "",
    },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        opt1: "",
        opt2: "",
        opt3: "",
        opt4: "",
        keyAnswer: "",
      },
    ]);
  };

  const handleQuestionChange = (index, e) => {
    const { name: fieldName, value } = e.target;
    const updatedQuestions = [...questions];
    updatedQuestions[index][fieldName] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await dispatch(createTest({ name, questions }, classId));
    if (success) {
      await dispatch(getLecturerBatchs());
      navigate("/streamClass", { state: { batchId, classRoomId, classId } });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content">
        <form onSubmit={handleSubmit} className="surface-panel p-6 md:p-8 space-y-6">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Assessment Builder</span>
          <h2 className="title-dark text-3xl">Create New Test</h2>

          <div>
            <label className="field-label">Test Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Class-1-Test-1"
              disabled={lecturerWork?.isloading}
              className="field-input"
            />
          </div>

          {lecturerWork?.isloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Creating test...</span>
                <span>Please wait</span>
              </div>
              <LinearProgress
                sx={{
                  height: 10,
                  borderRadius: 999,
                  backgroundColor: "#e7e5e4",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)",
                  },
                }}
              />
            </div>
          )}

          <h3 className="text-xl font-semibold text-gray-700">Questions</h3>
          {questions.map((q, index) => (
            <div key={index} className="content-card p-5 space-y-4">
              <label className="field-label">Question {index + 1}</label>
              <input
                type="text"
                name="questionText"
                value={q.questionText}
                onChange={(e) => handleQuestionChange(index, e)}
                required
                disabled={lecturerWork?.isloading}
                className="field-input"
              />

              {[1, 2, 3, 4].map((num) => (
                <div key={num}>
                  <label className="field-label">Option {num}</label>
                  <input
                    type="text"
                    name={`opt${num}`}
                    value={q[`opt${num}`]}
                    onChange={(e) => handleQuestionChange(index, e)}
                    required
                    disabled={lecturerWork?.isloading}
                    className="field-input"
                  />
                </div>
              ))}

              <div>
                <label className="field-label">Correct Answer Key</label>
                <select
                  name="keyAnswer"
                  value={q.keyAnswer}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                  disabled={lecturerWork?.isloading}
                  className="field-select"
                >
                  <option value="">-- Select Correct Option --</option>
                  <option value="opt-1">Option 1</option>
                  <option value="opt-2">Option 2</option>
                  <option value="opt-3">Option 3</option>
                  <option value="opt-4">Option 4</option>
                </select>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap justify-between items-center gap-4">
            <button type="button" onClick={addQuestion} disabled={lecturerWork?.isloading} className="secondary-btn disabled:opacity-70 disabled:cursor-not-allowed">
              Add Question
            </button>
            <button type="submit" disabled={lecturerWork?.isloading} className="primary-btn disabled:opacity-70 disabled:cursor-not-allowed">
              <span className="flex items-center justify-center gap-3">
                {lecturerWork?.isloading ? <SyncLoader color="white" size={8} /> : null}
                <span>{lecturerWork?.isloading ? "Creating Test..." : "Create Test"}</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTest;
