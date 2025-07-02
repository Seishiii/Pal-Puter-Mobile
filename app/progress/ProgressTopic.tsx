"use client";

import { topics, subtopics } from "@/db/schema";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import ProgressSubtopic from "./ProgressSubtopic";

type Props = {
  topic: typeof topics.$inferSelect & {
    subtopics: (typeof subtopics.$inferSelect & {
      completed: boolean;
      latestScore?: number;
    })[];
  };
  activeSubtopicId?: number;
};

const ProgressTopic = ({ topic, activeSubtopicId }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate topic progress
  const completedSubtopics = topic.subtopics.filter(
    (st) => st.completed
  ).length;
  const topicProgress = Math.round(
    (completedSubtopics / topic.subtopics.length) * 100
  );

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-white/15 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              topicProgress === 100 ? "bg-green-500" : "bg-purple-600"
            }`}
          >
            {topicProgress === 100 ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <span className="text-lg font-bold">{topicProgress}%</span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold">{topic.title}</h2>
            <p className="text-purple-200 text-sm mt-1">{topic.description}</p>
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown className="text-purple-300" />
        ) : (
          <ChevronRight className="text-purple-300" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-white/20 p-6 pt-4">
          <div className="grid gap-4">
            {topic.subtopics.map((subtopic, index) => (
              <ProgressSubtopic
                key={subtopic.id}
                subtopic={subtopic}
                index={index}
                isActive={subtopic.id === activeSubtopicId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTopic;
