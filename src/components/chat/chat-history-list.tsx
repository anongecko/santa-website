import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface Session {
  id: string;
  date: string;
  preview: string;
  isActive?: boolean;
}

interface ChatHistoryListProps {
  sessions: Session[];
  activeSessionId: string;
  onSessionClick: (id: string) => void;
}

export function ChatHistoryList({
  sessions,
  activeSessionId,
  onSessionClick,
}: ChatHistoryListProps) {
  const validSessions = sessions.filter(session => session.id && session.date && session.preview);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-2">
      {validSessions.map(session => (
        <Button
          key={session.id}
          variant="ghost"
          className={`w-full text-left space-y-1 ${session.id === activeSessionId ? 'bg-white/10' : ''}`}
          onClick={() => onSessionClick(session.id)}
        >
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>{formatDate(session.date)}</span>
          </div>
          <p className="text-xs text-white/60 line-clamp-2">{session.preview}</p>
        </Button>
      ))}
      {validSessions.length === 0 && (
        <div className="text-center text-white/60 text-sm py-4">No chat history yet</div>
      )}
    </div>
  );
}
