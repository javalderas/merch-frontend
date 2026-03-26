"use client"

import { useCallback, useState } from "react"
import { X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const MAX_DIM = 800

async function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          } else {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface ImageUploadProps {
  value?: string | null
  onChange: (dataUrl: string | null) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      if (!file.type.startsWith("image/")) {
        setError("El archivo debe ser una imagen (JPG, PNG, WebP)")
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("La imagen supera el límite de 5 MB")
        return
      }
      try {
        const dataUrl = await resizeToDataUrl(file)
        onChange(dataUrl)
      } catch {
        setError("Error al procesar la imagen")
      }
    },
    [onChange]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""
  }

  if (value) {
    return (
      <div className="relative w-full max-w-[200px] overflow-hidden rounded-lg border border-border">
        <img
          src={value}
          alt="Imagen del producto"
          className="aspect-square h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
          aria-label="Eliminar imagen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleInput}
        />
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Arrastra o haz clic para seleccionar</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Recomendado: 400×400 px · Máx. 5 MB · JPG, PNG, WebP
          </p>
          <p className="text-xs text-muted-foreground">
            Si supera 800×800 px se redimensiona automáticamente
          </p>
        </div>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
