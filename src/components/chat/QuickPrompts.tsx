import { Button } from "@/components/ui/button"

interface QuickPromptProps {
  onPromptSelect: (prompt: string) => void
}

const QUICK_PROMPTS = [
  {
    title: "Tell Santa about your year",
    prompts: [
      "I helped others by...",
      "My best achievement this year was...",
      "I learned how to..."
    ]
  },
  {
    title: "Christmas Wishes",
    prompts: [
      "What I'd love for Christmas is...",
      "My dream gift would be...",
      "I'm excited about..."
    ]
  },
  {
    title: "North Pole Questions",
    prompts: [
      "How are the reindeer doing?",
      "What's your favorite cookie?",
      "Tell me about the elves!"
    ]
  }
]

export function QuickPrompts({ onPromptSelect }: QuickPromptProps) {
  return (
    <div className="mb-6 space-y-4 text-white/80">
      <h3 className="text-sm font-medium text-white/60">Quick Messages</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {QUICK_PROMPTS.map((category, i) => (
          <div key={i} className="space-y-2">
            <h4 className="text-xs font-medium text-white/40">{category.title}</h4>
            <div className="space-y-1">
              {category.prompts.map((prompt, j) => (
                <Button
                  key={j}
                  variant="ghost"
                  className="w-full justify-start text-xs text-white/70 hover:text-white hover:bg-white/5"
                  onClick={() => onPromptSelect(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
