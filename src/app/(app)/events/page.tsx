"use client"

import { useState } from "react"
import { Plus, CalendarDays, MapPin, Zap, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorFallback } from "@/components/ui/error-fallback"
import { EmptyState } from "@/components/ui/empty-state"
import { EventFormDialog } from "@/components/events/event-form-dialog"
import { useEvents, useCreateEvent, useSetEventStatus, useDeleteEvent } from "@/hooks/use-events"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { BandEvent } from "@/types/event"

const EVENT_TYPE_LABELS: Record<string, string> = {
  CONCERT: "Concierto",
  FESTIVAL: "Festival",
  SOLIDARITY: "Acto solidario",
  FAIR: "Feria",
  OTHER: "Otro",
}

export default function EventsPage() {
  const { data: events, isLoading, error, refetch } = useEvents()
  const createEvent = useCreateEvent()
  const setStatus = useSetEventStatus()
  const deleteEvent = useDeleteEvent()
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeEvent = events?.find((e) => e.status === "ACTIVE")

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorFallback onRetry={() => refetch()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Eventos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registra eventos para asociar ventas y estadísticas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo evento
        </Button>
      </div>

      {/* Active event highlight */}
      {activeEvent && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{activeEvent.name}</p>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Activo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {EVENT_TYPE_LABELS[activeEvent.type]} · {formatDate(activeEvent.date)}
                  {activeEvent.location && ` · ${activeEvent.location}`}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus.mutate({ id: activeEvent.id, status: "INACTIVE" })}
              disabled={setStatus.isPending}
            >
              Desactivar
            </Button>
          </CardContent>
        </Card>
      )}

      {!events?.length ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin eventos"
          description="Crea un evento para asociar las ventas a conciertos, festivales o ferias"
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onActivate={() => setStatus.mutate({ id: event.id, status: "ACTIVE" })}
              onDelete={() => deleteEvent.mutate(event.id)}
              isPending={setStatus.isPending || deleteEvent.isPending}
            />
          ))}
        </div>
      )}

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(values) =>
          createEvent.mutate(values, { onSuccess: () => setDialogOpen(false) })
        }
        isPending={createEvent.isPending}
      />
    </div>
  )
}

function EventCard({
  event,
  onActivate,
  onDelete,
  isPending,
}: {
  event: BandEvent
  onActivate: () => void
  onDelete: () => void
  isPending: boolean
}) {
  const isActive = event.status === "ACTIVE"

  return (
    <Card className={cn(isActive && "border-primary/30")}>
      <CardContent className="flex items-center justify-between py-3 px-4">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium">{event.name}</p>
            <Badge variant="secondary" className="text-xs">
              {EVENT_TYPE_LABELS[event.type] ?? event.type}
            </Badge>
            {isActive && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                Activo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(event.date)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActivate}
              disabled={isPending}
            >
              Activar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
