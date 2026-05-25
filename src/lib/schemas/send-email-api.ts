import { z } from "zod"

import { contactSchema } from "@/lib/schemas/email-form"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export const sendEmailApiSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  contato: contactSchema,
  assunto: z.string().trim().min(1, "Assunto é obrigatório"),
  mensagem: z.string().trim().optional(),
})

export type SendEmailApiInput = z.infer<typeof sendEmailApiSchema>

export function validateAttachment(file: File | null) {
  if (!file || file.size === 0) {
    return { valid: true as const, file: null }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false as const,
      error: "O arquivo deve ter no máximo 10MB",
    }
  }

  return { valid: true as const, file }
}
