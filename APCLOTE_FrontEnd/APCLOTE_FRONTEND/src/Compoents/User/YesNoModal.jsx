import { createRoot } from "react-dom/client";

export function YesNoModal({ question, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm z-50 px-4">
      <div className="surface-panel max-w-sm w-full text-center p-6">
        <p className="text-lg font-medium mb-5">{question}</p>
        <div className="flex justify-center gap-4">
          <button onClick={() => onClose(true)} className="primary-btn !py-2 !px-6">
            Yes
          </button>
          <button onClick={() => onClose(false)} className="danger-btn !py-2 !px-6">
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export function askYesNo(question) {
  return new Promise((resolve) => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    const handleClose = (answer) => {
      root.unmount();
      div.remove();
      resolve(answer);
    };

    const root = createRoot(div);
    root.render(<YesNoModal question={question} onClose={handleClose} />);
  });
}
