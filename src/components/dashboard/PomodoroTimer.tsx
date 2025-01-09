import { useState, useEffect } from "react";
import { Timer, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./DashboardCard";

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  return (
    <DashboardCard title="Pomodoro Timer" icon={<Timer className="h-5 w-5" />}>
      <div className="text-center">
        <div className="text-4xl font-bold mb-4 text-gray-700">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="hover:bg-pastel-purple/20"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="hover:bg-pastel-purple/20"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}