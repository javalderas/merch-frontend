"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { createSpecialOrderSchema, type CreateSpecialOrderFormValues } from "@/lib/validations/special-order-schema"
import { useCreateSpecialOrder } from "@/hooks/use-special-orders"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/format"

interface CreateSpecialOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSpecialOrderDialog({ open, onOpenChange }: CreateSpecialOrderDialogProps) {
  const { user } = useAuth()
  const createOrder = useCreateSpecialOrder()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateSpecialOrderFormValues>({
    resolver: zodResolver(createSpecialOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      items: [{ productName: "", quantity: 1, unitPrice: 0 }],
      deliveryMethod: "PICKUP",
      shippingAddress: "",
      shippingCost: undefined,
      paymentMethod: "CASH",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const watchedItems = watch("items")
  const watchedDeliveryMethod = watch("deliveryMethod")
  const watchedShippingCost = watch("shippingCost")

  const itemsTotal = (watchedItems ?? []).reduce(
    (sum, item) => sum + (Number(item?.unitPrice) || 0) * (Number(item?.quantity) || 0),
    0
  )
  const total = itemsTotal + (Number(watchedShippingCost) || 0)

  function onSubmit(values: CreateSpecialOrderFormValues) {
    createOrder.mutate(
      { data: values, sellerName: user.name },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo pedido especial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Nombre del cliente *</Label>
              <Input id="customerName" {...register("customerName")} placeholder="Nombre completo" />
              {errors.customerName && (
                <p className="text-xs text-destructive">{errors.customerName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Teléfono (opcional)</Label>
              <Input id="customerPhone" {...register("customerPhone")} placeholder="6XX XXX XXX" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label>Productos *</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Input
                      {...register(`items.${index}.productName`)}
                      placeholder="Nombre del producto"
                    />
                    {errors.items?.[index]?.productName && (
                      <p className="text-xs text-destructive">
                        {errors.items[index]?.productName?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 min-h-[44px] min-w-[44px] text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min={1}
                      value={watchedItems?.[index]?.quantity ?? 1}
                      onChange={(e) =>
                        setValue(
                          `items.${index}.quantity`,
                          e.target.value === "" ? 1 : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Precio unitario (€)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={watchedItems?.[index]?.unitPrice ?? ""}
                      onChange={(e) =>
                        setValue(
                          `items.${index}.unitPrice`,
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-xs text-destructive">{errors.items.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full min-h-[44px] gap-2"
              onClick={() => append({ productName: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4" />
              Añadir producto
            </Button>
          </div>

          {/* Delivery method */}
          <div className="space-y-1.5">
            <Label>Método de entrega *</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["PICKUP", "SHIPPING"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`min-h-[44px] rounded-md border text-sm font-medium transition-colors px-3 py-2 ${
                    watchedDeliveryMethod === method
                      ? method === "PICKUP"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-purple-500 bg-purple-500/10 text-purple-400"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => {
                    setValue("deliveryMethod", method)
                    if (method === "PICKUP") {
                      setValue("paymentMethod", "CASH")
                    }
                  }}
                >
                  {method === "PICKUP" ? "Recogida en mano" : "Envío por paquetería"}
                </button>
              ))}
            </div>
          </div>

          {/* Shipping fields */}
          {watchedDeliveryMethod === "SHIPPING" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress">Dirección de envío *</Label>
                <Input
                  id="shippingAddress"
                  {...register("shippingAddress")}
                  placeholder="Calle, número, piso, ciudad..."
                />
                {errors.shippingAddress && (
                  <p className="text-xs text-destructive">{errors.shippingAddress.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shippingCost">Coste de envío (€, opcional)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={watchedShippingCost ?? ""}
                  onChange={(e) =>
                    setValue(
                      "shippingCost",
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="space-y-1.5">
            <Label>Método de pago *</Label>
            <Select
              value={watch("paymentMethod")}
              onValueChange={(val) =>
                setValue("paymentMethod", val as CreateSpecialOrderFormValues["paymentMethod"])
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="BIZUM">Bizum</SelectItem>
                {watchedDeliveryMethod === "SHIPPING" && (
                  <SelectItem value="COD">Contrareembolso</SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Talla, color, instrucciones especiales..."
              rows={2}
            />
          </div>

          {/* Total */}
          <div className="rounded-lg bg-muted/50 p-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total estimado</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-h-[44px]"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 min-h-[44px]"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? "Creando..." : "Crear pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
