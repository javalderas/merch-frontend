import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorFallbackProps {
  message?: string
  onRetry?: () => void
}

export function ErrorFallback({
  message = "Ha ocurrido un error",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      )}
    </div>
  )
}
