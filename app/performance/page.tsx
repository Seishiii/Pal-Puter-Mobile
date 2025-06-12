import PerformanceDashboard from "@/components/PerformanceDashboard";

const PerformancePage = () => {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">
        Quiz Performance
      </h1>
      <PerformanceDashboard />
    </div>
  );
};

export default PerformancePage;
