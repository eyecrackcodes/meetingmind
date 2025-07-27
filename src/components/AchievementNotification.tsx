import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Star, Trophy, X, Sparkles, Crown, Zap } from "lucide-react";
import { GameEvent, Achievement } from "@/types";
import { GamificationService } from "@/lib/gamificationService";

interface AchievementNotificationProps {
  event: GameEvent;
  onClose: () => void;
  onViewAchievements?: () => void;
}

export function AchievementNotification({
  event,
  onClose,
  onViewAchievements,
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    // Show celebration effect
    if (event.type === "achievement_unlocked" || event.type === "level_up") {
      setTimeout(() => setShowCelebration(true), 500);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  const getEventIcon = () => {
    switch (event.type) {
      case "achievement_unlocked":
        return <Award className="h-8 w-8 text-yellow-500" />;
      case "level_up":
        return <Crown className="h-8 w-8 text-purple-500" />;
      case "streak_milestone":
        return <Zap className="h-8 w-8 text-orange-500" />;
      case "objective_completed":
        return <Trophy className="h-8 w-8 text-green-500" />;
      default:
        return <Star className="h-8 w-8 text-blue-500" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case "achievement_unlocked":
        return "from-yellow-400 to-orange-500";
      case "level_up":
        return "from-purple-400 to-pink-500";
      case "streak_milestone":
        return "from-orange-400 to-red-500";
      case "objective_completed":
        return "from-green-400 to-teal-500";
      default:
        return "from-blue-400 to-indigo-500";
    }
  };

  const achievement = event.data?.achievement as Achievement | undefined;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Celebration Effect */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${Math.random() * 1000}ms`,
                animationDuration: `${1000 + Math.random() * 1000}ms`,
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Notification */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`
            pointer-events-auto max-w-md w-full transform transition-all duration-500 ease-out
            ${
              isVisible
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-8 opacity-0 scale-95"
            }
          `}
        >
          <div
            className={`
            relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br ${getEventColor()}
            border-4 border-white/20 backdrop-blur-sm
          `}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 z-10"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Content */}
            <div className="relative p-6 text-white">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center animate-pulse">
                    {getEventIcon()}
                  </div>
                  {event.type === "achievement_unlocked" && achievement && (
                    <div className="absolute -top-2 -right-2">
                      <Badge
                        className={`text-xs px-2 py-1 ${gamificationService.getRarityColor(
                          achievement.rarity
                        )} border-2 border-white`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center mb-2">
                {event.title}
              </h3>

              {/* Description */}
              <p className="text-white/90 text-center mb-4 text-sm">
                {event.description}
              </p>

              {/* Achievement Details */}
              {event.type === "achievement_unlocked" && achievement && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="text-center">
                      <p className="font-semibold">{achievement.name}</p>
                      <p className="text-sm text-white/80">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Points */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2">
                  <Trophy className="h-4 w-4" />
                  <span className="font-bold">+{event.points} Points!</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  variant="secondary"
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Continue
                </Button>
                {onViewAchievements && (
                  <Button
                    onClick={() => {
                      onViewAchievements();
                      handleClose();
                    }}
                    variant="secondary"
                    className="flex-1 bg-white hover:bg-white/90 text-gray-900 border-white"
                  >
                    View All
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification Manager Component
interface NotificationManagerProps {
  onViewAchievements?: () => void;
}

export function NotificationManager({
  onViewAchievements,
}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<GameEvent[]>([]);
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const handleGameEvent = (event: GameEvent) => {
      // Only show notifications for significant events
      if (
        ["achievement_unlocked", "level_up", "streak_milestone"].includes(
          event.type
        )
      ) {
        setNotifications((prev) => [...prev, event]);
      }
    };

    gamificationService.addEventListener(handleGameEvent);

    return () => {
      gamificationService.removeEventListener(handleGameEvent);
    };
  }, []);

  const removeNotification = (eventId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== eventId));
  };

  return (
    <>
      {notifications.map((event) => (
        <AchievementNotification
          key={event.id}
          event={event}
          onClose={() => removeNotification(event.id)}
          onViewAchievements={onViewAchievements}
        />
      ))}
    </>
  );
}

// Toast notification for smaller achievements
interface ToastNotificationProps {
  event: GameEvent;
  onClose: () => void;
}

export function ToastNotification({ event, onClose }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed top-4 right-4 z-40 transform transition-all duration-300 ease-out
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
      `}
    >
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {event.type === "objective_completed" && (
              <Trophy className="h-6 w-6 text-green-500" />
            )}
            {event.type === "milestone_reached" && (
              <Star className="h-6 w-6 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {event.title}
            </p>
            <p className="text-xs text-gray-500 truncate">
              +{event.points} points
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Toast Manager for smaller notifications
export function ToastManager() {
  const [toasts, setToasts] = useState<GameEvent[]>([]);
  const gamificationService = GamificationService.getInstance();

  useEffect(() => {
    const handleGameEvent = (event: GameEvent) => {
      // Show toast for smaller events
      if (["objective_completed", "milestone_reached"].includes(event.type)) {
        setToasts((prev) => [...prev, event]);
      }
    };

    gamificationService.addEventListener(handleGameEvent);

    return () => {
      gamificationService.removeEventListener(handleGameEvent);
    };
  }, []);

  const removeToast = (eventId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== eventId));
  };

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {toasts.slice(0, 3).map((event, index) => (
        <div
          key={event.id}
          style={{ transform: `translateY(${index * 80}px)` }}
        >
          <ToastNotification
            event={event}
            onClose={() => removeToast(event.id)}
          />
        </div>
      ))}
    </div>
  );
}
