import { AxiosError } from "axios"
import type { ProblemDetail } from "@/types/error"

const DEFAULT_ERROR: ProblemDetail = {
  detail: "Ha ocurrido un error inesperado",
}

export function extractErrorDetail(error: unknown): ProblemDetail {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data
    if (typeof data === "object" && "detail" in data) {
      return data as ProblemDetail
    }
  }

  if (error instanceof Error) {
    return { detail: error.message }
  }

  return DEFAULT_ERROR
}
