import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Terminal } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] flex-col items-center justify-center text-center">
      <Terminal className="h-24 w-24 text-primary text-glow-primary" />
      <h1 className="mt-8 font-headline text-6xl font-bold">
        404
      </h1>
      <p className="mt-4 text-2xl text-muted-foreground">
        Page Lost in the Grid
      </p>
      <p className="mt-2 max-w-md text-muted-foreground">
        The requested endpoint does not exist on this server. Check the URL or return to the dashboard.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}
