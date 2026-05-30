import React from "react";
import { useSelector } from "react-redux";
import store from "../../Store/store";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const UTA = () => {

    const location=useLocation()
    const {userTA}=location.state||null
  const { test, userAnswers, correctAns, wrongAns } = userTA;
  const questions = test.questions || [];
  const total = questions.length;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-100 shadow-lg rounded-2xl">
      <h1 className="text-3xl font-bold text-center mb-4">{test.name}</h1>
      <p className="text-center text-gray-600 mb-6">📅 {test.date}</p>

      <div className="flex justify-center gap-6 text-lg font-medium mb-8">
        <p>
          🧾 Total: <span className="text-blue-600 font-semibold">{total}</span>
        </p>
        <p>
          ✅ Correct: <span className="text-green-600 font-semibold">{correctAns}</span>
        </p>
        <p>
          ❌ Wrong: <span className="text-red-600 font-semibold">{wrongAns}</span>
        </p>
      </div>

      {questions.map((q, index) => {
        const userSelected = userAnswers[index];
        const correct = q.keyAnswer;

        return (
          <div
            key={q.id}
            className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="font-semibold mb-4 text-lg">
              {index + 1}. {q.questionText}
            </h3>

            {[q.opt1, q.opt2, q.opt3, q.opt4].map((opt, i) => {
              const optKey = `opt-${i + 1}`;
              const isUser = optKey === userSelected;
              const isCorrect = optKey === correct;

              let optionStyle =
                "p-2 border rounded mb-2 transition-all duration-200";
              if (isUser && isCorrect)
                optionStyle += " bg-green-100 border-green-500";
              else if (isUser && !isCorrect)
                optionStyle += " bg-red-100 border-red-500";
              else if (!isUser && isCorrect)
                optionStyle += " bg-green-50 border-green-400";
              else optionStyle += " border-gray-300";

              return (
                <div key={optKey} className={optionStyle}>
                  <span className="font-medium">{opt.trim()}</span>
                  {isUser && isCorrect && (
                    <span className="ml-2 text-green-600 font-semibold">
                      ✓ Correct
                    </span>
                  )}
                  {isUser && !isCorrect && (
                    <span className="ml-2 text-red-600 font-semibold">
                      ✗ Incorrect
                    </span>
                  )}
                  {!isUser && isCorrect && userSelected !== correct && (
                    <span className="ml-2 text-green-600 font-semibold">
                      (Correct Answer)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default UTA;
