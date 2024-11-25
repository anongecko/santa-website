import { motion } from 'framer-motion'
import { Calendar, MessageSquare, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  sessions: Array<{
    id: string
    date: Date
    preview: string
    gifts: number
  }>
  currentSessionId: string
  onSessionClick: (id: string) => void
}

export function ChatHistoryPanel({ 
  isOpen, 
  onClose, 
  sessions,
  currentSessionId,
  onSessionClick
}: ChatHistoryProps) {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-20 w-[300px] lg:relative lg:z-0",
        "bg-[#1a1b1e] border-r border-white/10"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="font-semibold text-white/80">Chat History</h2>
        <Button 
          variant="ghost" 
          size="icon"
          className="lg:hidden text-white/60 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)] p-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 text-white/60">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No previous conversations</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <Button
                key={session.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left p-3 h-auto space-y-1",
                  "hover:bg-white/5",
                  currentSessionId === session.id && "bg-white/5"
                )}
                onClick={() => onSessionClick(session.id)}
              >
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Calendar className="h-4 w-4 opacity-50" />
                  {formatDistanceToNow(session.date, { addSuffix: true })}
                </div>
                <p className="text-xs text-white/60 line-clamp-2">
                  {session.preview}
                </p>
                {session.gifts > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <span>{session.gifts} gifts noted</span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  )
}
