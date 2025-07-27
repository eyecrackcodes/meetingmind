import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { ProgressData } from "@/types";

interface ProgressTrackerProps {
  progress: ProgressData;
}

export function ProgressTracker({ progress }: ProgressTrackerProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Meeting Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress.percentage} className="h-4" />
          <div className="text-center">
            <p className="text-lg font-semibold">
              {progress.percentage}% Complete
            </p>
            <p className="text-sm text-muted-foreground">
              {progress.completedItems} of {progress.totalItems} items completed
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
