import { courses } from "@/db/schema";
import { Progress } from "@/components/ui/progress";

type Props = {
  course: typeof courses.$inferSelect;
  progress: number;
};

const ProgressHeader = ({ course, progress }: Props) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
          <p className="text-purple-200 mt-1">Course Progress Overview</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-purple-200">Overall Progress</p>
            <p className="text-2xl font-bold">{progress}%</p>
          </div>

          <div className="w-32">
            <Progress value={progress} className="h-3 bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressHeader;
