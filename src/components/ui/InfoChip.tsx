import { Chip } from '@heroui/react'
import type { ChipProps } from '@heroui/react'
import type { ReactNode } from 'react'

export type InfoChipProps = {
  children: ReactNode
} & Omit<ChipProps, 'classNames'>

export const InfoChip = ({ children, radius = 'sm', size = 'sm', ...rest }: InfoChipProps) => {
  return (
    <Chip
      radius={radius}
      size={size}
      classNames={{
        base: 'chip-base chip-info',
        content: 'chip-content',
      }}
      {...rest}
    >
      {children}
    </Chip>
  )
}