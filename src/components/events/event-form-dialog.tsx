"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CreateEventRequest } from "@/types/event"

const schema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  type: z.enum(["CONCERT", "FESTIVAL", "SOLIDARITY", "FAIR", "OTHER"]),
  date: z.string().min(1, "Fecha requerida"),
  location: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CreateEventRequest) => void
  isPending?: boolean
}

export function EventFormDialog({ open, onOpenChange, onSubmit, isPending }: EventFormDialogProps) {
  const today = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "CONCERT",
      date: today,
    },
  })

  function onValid(values: FormValues) {
    onSubmit({
      name: values.name,
      type: values.type,
      date: values.date,
      location: values.location || undefined,
      notes: values.notes || undefined,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onValid)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" placeholder="Ej: Festival Primavera Sound" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as FormValues["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONCERT">Concierto</SelectItem>
                  <SelectItem value="FESTIVAL">Festival</SelectItem>
                  <SelectItem value="SOLIDARITY">Acto solidario</SelectItem>
                  <SelectItem value="FAIR">Feria</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Fecha *</Label>
              <Input id="date" type="date" {...register("date")} className="min-h-[44px]" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Lugar</Label>
            <Input id="location" placeholder="Ej: Madrid, WiZink Center" {...register("location")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Crear evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
