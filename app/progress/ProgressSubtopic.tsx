import { subtopics } from "@/db/schema";
import { Check } from "lucide-react";

type Props = {
  subtopic: typeof subtopics.$inferSelect & {
    completed: boolean;
    latestScore?: number;
  };
  index: number;
  isActive?: boolean;
};

const ProgressSubtopic = ({ subtopic, index, isActive }: Props) => {
  return (
    <div
      className={`
      p-4 rounded-xl flex items-center gap-4
      ${isActive ? "bg-purple-700/50 border border-purple-500" : "bg-white/5"}
      ${subtopic.completed ? "border-green-500/30" : ""}
      transition-all
    `}
    >
      <div
        className={`
        w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
        ${subtopic.completed ? "bg-green-500" : "bg-purple-700"}
        ${isActive ? "ring-2 ring-purple-400" : ""}
      `}
      >
        {subtopic.completed ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <span className="font-bold">{index + 1}</span>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{subtopic.title}</h3>
          {subtopic.isQuiz && (
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
              Quiz
            </span>
          )}
          {isActive && (
            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
              Current
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {subtopic.isQuiz && subtopic.latestScore !== undefined && (
          <div
            className={`
            px-3 py-1 rounded-full text-sm font-bold
            ${
              subtopic.latestScore >= 70
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }
          `}
          >
            {subtopic.latestScore}%
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSubtopic;
