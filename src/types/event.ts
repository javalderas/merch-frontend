export type EventType = "CONCERT" | "FESTIVAL" | "SOLIDARITY" | "FAIR" | "OTHER"
export type EventStatus = "ACTIVE" | "INACTIVE"

export interface BandEvent {
  id: string
  name: string
  type: EventType
  date: string // YYYY-MM-DD
  location?: string
  status: EventStatus
  notes?: string
  createdAt: string
}

export interface CreateEventRequest {
  name: string
  type: EventType
  date: string
  location?: string
  notes?: string
}
