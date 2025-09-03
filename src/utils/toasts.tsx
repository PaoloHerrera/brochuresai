import { addToast } from '@heroui/react'
import { CircleX } from 'lucide-react'

export const showErrorToast = (title: string, description?: string) => {
  addToast({
    title,
    description,
    color: 'danger',
    icon: <CircleX color="white" />,
  })
}