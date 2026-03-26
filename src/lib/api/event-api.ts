import {
  getEvents,
  getActiveEvent,
  createEvent,
  setEventStatus,
  deleteEvent,
  getTodaySales,
} from "./mock-store"
import type { CreateEventRequest, EventStatus } from "@/types/event"

type Actor = { userId: string; userName: string }

export async function fetchEvents() {
  return getEvents()
}

export async function fetchActiveEvent() {
  return getActiveEvent()
}

export async function fetchTodaySales() {
  return getTodaySales()
}

export async function apiCreateEvent(data: CreateEventRequest, actor: Actor) {
  return createEvent(data, actor)
}

export async function apiSetEventStatus(id: string, status: EventStatus, actor: Actor) {
  return setEventStatus(id, status, actor)
}

export async function apiDeleteEvent(id: string, actor: Actor) {
  return deleteEvent(id, actor)
}
