import { CircleX, CheckCircle2 } from 'lucide-react'

export const showErrorToast = async (title: string, description?: string) => {
  const { addToast } = await import('@heroui/react')
  addToast({
    title,
    description,
    color: 'danger',
    icon: <CircleX color="white" />,
  })
}

export const showSuccessToast = async (title: string, description?: string) => {
  const { addToast } = await import('@heroui/react')
  addToast({
    title,
    description,
    color: 'success',
    icon: <CheckCircle2 color="white" />,
  })
}