import { Badge } from '@adobe/react-spectrum'
import type { StatusBadgeProps } from '../../types/components'

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const variantMap = {
    upcoming: 'info',
    in_progress: 'informative',
    completed: 'positive',
    cancelled: 'neutral',
  } as const

  const labelMap = {
    upcoming: 'Upcoming',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }

  return (
    <Badge
      variant={variantMap[status]}
      data-status={status}
    >
      {labelMap[status]}
    </Badge>
  )
}
