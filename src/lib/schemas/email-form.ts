import { z } from "zod"

import { CONTACT_OPTIONS } from "@/lib/contacts"

const MAX_FILE_SIZE = 10 * 1024 * 1024

const allowedContactEmails = CONTACT_OPTIONS.map((contact) => contact.email)

export const contactSchema = z
  .string({
    error: "Contato é obrigatório",
  })
  .min(1, "Contato é obrigatório")
  .email("E-mail de contato inválido")
  .refine(
    (value) => (allowedContactEmails as readonly string[]).includes(value),
    {
      message: "Selecione um contato válido",
    },
  )

export const emailFormSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  contato: contactSchema,
  assunto: z.string().trim().min(1, "Assunto é obrigatório"),
  mensagem: z.string().trim().optional(),
  anexo: z
    .custom<FileList | undefined>(
      (value) =>
        value !== undefined &&
        typeof FileList !== "undefined" &&
        value instanceof FileList,
    )
    .refine((files) => !!files && files.length > 0, {
      error: "Anexe um arquivo",
    })
    .refine(
      (files) => !!files && !!files[0] && files[0].size <= MAX_FILE_SIZE,
      {
        error: "O arquivo deve ter no máximo 10MB",
      },
    ),
})

export type EmailFormValues = z.infer<typeof emailFormSchema>
