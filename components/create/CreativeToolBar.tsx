'use client'

import {
  Sparkles,
  Upload,
  User,
  Music,
  Gem,
  Shirt,
  Image,
  Scissors,
  Sun,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ToolId =
  | 'generate'
  | 'upload'
  | 'avatars'
  | 'music'
  | 'jewelry'
  | 'dressing'
  | 'backgrounds'
  | 'hair'
  | 'lighting'
  | 'decorations'

const TOOLS: { id: ToolId; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'generate', icon: Sparkles, label: 'Generate' },
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'avatars', icon: User, label: 'Avatars' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'jewelry', icon: Gem, label: 'Jewelry' },
  { id: 'dressing', icon: Shirt, label: 'Dressing' },
  { id: 'backgrounds', icon: Image, label: 'Backgrounds' },
  { id: 'hair', icon: Scissors, label: 'Hair & Color' },
  { id: 'lighting', icon: Sun, label: 'Lighting' },
  { id: 'decorations', icon: Gift, label: 'Decorations' },
]

interface CreativeToolBarProps {
  activeTool: ToolId | null
  onToolChange: (tool: ToolId) => void
  disabled?: boolean
}

export function CreativeToolBar({ activeTool, onToolChange, disabled }: CreativeToolBarProps) {
  return (
    <TooltipProvider>
      <div className="flex-shrink-0 flex items-center justify-center gap-1 bg-white text-gray-900 rounded-2xl border-[3px] border-brand-gold/50 shadow-sm px-3 py-2">
        {TOOLS.map(({ id, icon: Icon, label }) => {
          const isActive = !disabled && activeTool === id
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  className={cn(
                    'h-10 w-10 rounded-xl transition-colors',
                    disabled && 'opacity-50 cursor-not-allowed',
                    isActive
                      ? 'bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  )}
                  onClick={() => !disabled && onToolChange(id)}
                >
                  <Icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
