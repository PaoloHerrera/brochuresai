import { Chip } from '@heroui/react'
import type { ChipProps } from '@heroui/react'
import type { ReactNode } from 'react'

export type EyebrowChipProps = {
  children: ReactNode
  ariaLabel?: string
} & Omit<ChipProps, 'children' | 'classNames' | 'size' | 'radius' | 'variant'>

export const EyebrowChip = ({ children, ariaLabel, ...rest }: EyebrowChipProps) => {
  const computedAria = ariaLabel ?? (typeof children === 'string' ? children : undefined)
  return (
    <Chip
      radius="sm"
      size="sm"
      variant="bordered"
      aria-label={computedAria}
      classNames={{
        base: 'chip-base chip-accent',
        content: 'chip-content',
      }}
      {...rest}
    >
      {children}
    </Chip>
  )
}