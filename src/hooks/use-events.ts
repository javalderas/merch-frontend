import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  fetchEvents,
  fetchActiveEvent,
  fetchTodaySales,
  apiCreateEvent,
  apiSetEventStatus,
  apiDeleteEvent,
} from "@/lib/api/event-api"
import { useAuth } from "@/contexts/auth-context"
import type { CreateEventRequest, EventStatus } from "@/types/event"

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  })
}

export function useActiveEvent() {
  return useQuery({
    queryKey: ["events", "active"],
    queryFn: fetchActiveEvent,
  })
}

export function useTodaySales() {
  return useQuery({
    queryKey: ["sales", "today"],
    queryFn: fetchTodaySales,
    refetchInterval: 30_000,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (data: CreateEventRequest) =>
      apiCreateEvent(data, { userId: user.id, userName: user.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      toast.success("Evento creado")
    },
    onError: () => toast.error("Error al crear el evento"),
  })
}

export function useSetEventStatus() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) =>
      apiSetEventStatus(id, status, { userId: user.id, userName: user.name }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["sales", "today"] })
      toast.success(status === "ACTIVE" ? "Evento activado" : "Evento desactivado")
    },
    onError: () => toast.error("Error al actualizar el evento"),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (id: string) =>
      apiDeleteEvent(id, { userId: user.id, userName: user.name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      toast.success("Evento eliminado")
    },
    onError: () => toast.error("Error al eliminar el evento"),
  })
}
