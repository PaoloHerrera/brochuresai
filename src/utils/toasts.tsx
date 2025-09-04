import { addToast } from '@heroui/react'
import { CircleX, CheckCircle2 } from 'lucide-react'

export const showErrorToast = (title: string, description?: string) => {
  addToast({
    title,
    description,
    color: 'danger',
    icon: <CircleX color="white" />,
  })
}

export const showSuccessToast = (title: string, description?: string) => {
  addToast({
    title,
    description,
    color: 'success',
    icon: <CheckCircle2 color="white" />,
  })
}