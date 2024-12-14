import { motion } from 'framer-motion'
import { Gift as GiftIcon, Star, X, ShoppingCart, ChevronRight, TagIcon, AlertCircle } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Badge,
  badgeVariants
} from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatDistanceToNow } from 'date-fns'
import type { Gift } from '@/types/chat'

interface GiftTrackingProps {
  isOpen: boolean
  onClose: () => void
  gifts: Gift[]
  onUpdateGift: (id: string, updates: Partial<Gift>) => void
  className?: string  // Add this line to fix the TypeScript error
}

const GIFT_CATEGORIES = [
  { id: 'toys', label: 'Toys', icon: '🧸' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'art', label: 'Art Supplies', icon: '🎨' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'other', label: 'Other', icon: '🎁' }
]

const priorityInfo = {
  high: { 
    color: "text-red-500 bg-red-500/10 border-red-500/20",
    label: "High Priority",
    description: "Top of the wishlist" 
  },
  medium: { 
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    label: "Medium Priority",
    description: "Nice to have" 
  },
  low: { 
    color: "text-green-500 bg-green-500/10 border-green-500/20",
    label: "Low Priority",
    description: "Just a thought" 
  }
}

export function GiftTrackingPanel({ 
  isOpen, 
  onClose, 
  gifts,
  onUpdateGift
}: GiftTrackingProps) {
  const handlePriorityChange = (giftId: string) => {
    const priorities: Array<Gift['priority']> = ['high', 'medium', 'low']
    const gift = gifts.find(g => g.id === giftId)
    if (!gift) return
    
    const currentIndex = priorities.indexOf(gift.priority)
    const nextPriority = priorities[(currentIndex + 1) % priorities.length]
    onUpdateGift(giftId, { priority: nextPriority })
  }

  const sortedGifts = [...gifts].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return b.mentionCount - a.mentionCount
  })

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 300, opacity: isOpen ? 1 : 0 }}
      className={cn(
        "fixed right-0 top-0 bottom-0 z-20 w-[300px] lg:relative lg:z-0",
        "bg-[#1a1b1e] border-l border-white/10"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <GiftIcon className="w-4 h-4 text-santa-red" />
          <h2 className="font-semibold text-white/80">Wishlist</h2>
          <Badge variant="secondary" className="text-xs">
            {gifts.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="lg:hidden text-white/60 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-60px)] p-4">
        {gifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-white/60">
            <ShoppingCart className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No gifts noted yet</p>
            <p className="text-xs mt-1 text-white/40">
              Gifts mentioned in chat will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGifts.map(gift => (
              <Card 
                key={gift.id} 
                className="bg-[#2d2e32] border-white/10 hover:bg-[#35363a] transition-colors"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm text-white/90">
                        {gift.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-white/50">
                        First mentioned{' '}
                        {formatDistanceToNow(gift.firstMentioned, { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "px-2 h-6 text-xs rounded-full",
                            priorityInfo[gift.priority].color
                          )}
                          onClick={() => handlePriorityChange(gift.id)}
                        >
                          {priorityInfo[gift.priority].label}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{priorityInfo[gift.priority].description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Star className="w-3 h-3" />
                    <span>Mentioned {gift.mentionCount} times</span>
                  </div>
                  {gift.category && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs text-white/60",
                          "flex items-center gap-1"
                        )}
                      >
                        {GIFT_CATEGORIES.find(c => c.id === gift.category)?.icon}
                        {GIFT_CATEGORIES.find(c => c.id === gift.category)?.label}
                      </Badge>
                    </div>
                  )}
                  {!gift.category && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {GIFT_CATEGORIES.slice(0, 3).map(category => (
                        <Tooltip key={category.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-white/40 hover:text-white"
                              onClick={() => onUpdateGift(gift.id, { category: category.id })}
                            >
                              <span className="mr-1">{category.icon}</span>
                              {category.label}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Set as {category.label.toLowerCase()} category</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </motion.div>
  )
}
