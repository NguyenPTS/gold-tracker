import {
  Loader2,
  Coins,
  CheckCircle2,
  type Icon as LucideIcon,
} from "lucide-react"

export type Icon = typeof LucideIcon

export const Icons = {
  spinner: Loader2,
  goldBar: Coins,
  check: CheckCircle2,
} as const 