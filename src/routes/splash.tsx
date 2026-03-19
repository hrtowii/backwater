import { createFileRoute } from '@tanstack/react-router'
import AppHome from '../components/AppHome'

export const Route = createFileRoute('/splash')({
  component: AppHome,
})
