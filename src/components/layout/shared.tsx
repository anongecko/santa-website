// src/components/layout/shared.tsx
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionTitle({ children, className, as = 'h2' }: SectionTitleProps) {
  const Comp = as
  
  return (
    <Comp className={cn(
      "text-3xl md:text-4xl lg:text-5xl font-bold",
      className
    )}>
      {children}
    </Comp>
  )
}

export function SectionDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className={cn(
        "text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto",
        className
      )}
    >
      {children}
    </motion.p>
  )
}

export function SectionContainer({ 
  children, 
  className,
  id 
}: { 
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section 
      id={id}
      className={cn(
        "relative py-20 md:py-32 overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4 relative">
        {children}
      </div>
    </section>
  )
}
