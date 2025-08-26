import type { FC, PropsWithChildren } from 'react'

interface ContainerProps extends PropsWithChildren {
  className?: string
}

const base = 'w-full max-w-[1400px] mx-auto px-0 md:px-8 lg:px-10'

export const Container: FC<ContainerProps> = ({ children, className }) => {
  return <div className={className ? base + ' ' + className : base}>{children}</div>
}