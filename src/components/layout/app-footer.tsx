import Copyright from '@/components/Copyright'
import { Separator } from '@/components/ui/separator'

export default function AppFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
      <Separator />
      <Copyright />
    </footer>
  )
}
