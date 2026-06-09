"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircleIcon, Send, Trash, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CONTACT_OPTIONS } from "@/lib/contacts"
import { type EmailFormValues, emailFormSchema } from "@/lib/schemas/email-form"
import { cn } from "@/lib/utils"

const inputBaseClassName =
  "flex w-full rounded-md border bg-zinc-800 px-3 text-base text-zinc-50 placeholder:text-zinc-500 outline-none md:text-sm"

const inputErrorClassName = "border-red-500"

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="text-sm text-red-500">{message}</p>
}

export function EmailForm() {
  const [fileName, setFileName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      nome: "",
      contato: "",
      assunto: "",
      mensagem: "",
    },
  })

  const onSubmit = async (data: EmailFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const body = new FormData()
      body.append("nome", data.nome)
      body.append("contato", data.contato)
      body.append("assunto", data.assunto)
      if (data.mensagem) {
        body.append("mensagem", data.mensagem)
      }
      if (data.anexo?.[0]) {
        body.append("anexo", data.anexo[0])
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        body,
      })

      const result = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao enviar e-mail")
      }

      reset({
        nome: "",
        contato: "",
        assunto: "",
        mensagem: "",
      })
      setFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("Email enviado com sucesso.")
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Erro ao enviar e-mail",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const { ref: anexoRef, ...anexoRegister } = register("anexo", {
    onChange: (event) => {
      setFileName(event.target.files?.[0]?.name ?? "")
    },
  })

  const removeAttachment = () => {
    setFileName("")
    setValue("anexo", undefined)
    clearErrors("anexo")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="nome"
            className="text-sm font-medium leading-none text-zinc-100"
          >
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            id="nome"
            type="text"
            placeholder="Seu nome completo"
            aria-invalid={Boolean(errors.nome)}
            className={cn(
              inputBaseClassName,
              "h-9 py-1",
              errors.nome ? inputErrorClassName : "border-zinc-700",
            )}
            {...register("nome")}
          />
          <FieldError message={errors.nome?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="contato"
            className="text-sm font-medium leading-none text-zinc-100"
          >
            Contato <span className="text-red-500">*</span>
          </label>
          <Controller
            name="contato"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="contato"
                  aria-invalid={Boolean(errors.contato)}
                  className={cn(
                    "h-9",
                    errors.contato
                      ? "border-red-500! focus:ring-red-500"
                      : "border-zinc-700",
                  )}
                >
                  <SelectValue placeholder="Selecione o seu contato" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_OPTIONS.map((contact) => (
                    <SelectItem key={contact.email} value={contact.email}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.contato?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="assunto"
          className="text-sm font-medium leading-none text-zinc-100"
        >
          Assunto <span className="text-red-500">*</span>
        </label>
        <input
          id="assunto"
          type="text"
          placeholder="Assunto do e-mail"
          aria-invalid={Boolean(errors.assunto)}
          className={cn(
            inputBaseClassName,
            "h-9 py-1",
            errors.assunto ? inputErrorClassName : "border-zinc-700",
          )}
          {...register("assunto")}
        />
        <FieldError message={errors.assunto?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="mensagem"
          className="text-sm font-medium leading-none text-zinc-100"
        >
          Mensagem
        </label>
        <textarea
          id="mensagem"
          rows={6}
          placeholder="Digite sua mensagem aqui..."
          aria-invalid={Boolean(errors.mensagem)}
          className={cn(
            inputBaseClassName,
            "min-h-16 resize-none py-2",
            errors.mensagem ? inputErrorClassName : "border-zinc-700",
          )}
          {...register("mensagem")}
        />
        <FieldError message={errors.mensagem?.message} />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="anexo"
          className="text-sm font-medium leading-none text-zinc-100"
        >
          Anexo
        </label>
        <input
          id="anexo"
          type="file"
          className="sr-only"
          aria-invalid={Boolean(errors.anexo)}
          ref={(element) => {
            anexoRef(element)
            fileInputRef.current = element
          }}
          {...anexoRegister}
        />
        {fileName ? (
          <div
            className={cn(
              "flex h-9 items-center gap-2 rounded-md border bg-zinc-800 px-4 py-2 text-sm text-zinc-300",
              errors.anexo ? inputErrorClassName : "border-zinc-700",
            )}
          >
            <span className="min-w-0 flex-1 truncate">{fileName}</span>
            <button
              type="button"
              onClick={removeAttachment}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-50"
              aria-label="Remover anexo"
            >
              <Trash
                className="size-4 text-red-500 hover:text-red-600 hover:cursor-pointer"
                aria-hidden
              />
            </button>
          </div>
        ) : (
          <label
            htmlFor="anexo"
            className={cn(
              "flex h-9 cursor-pointer items-center gap-2 rounded-md border bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700",
              errors.anexo ? inputErrorClassName : "border-zinc-700",
            )}
          >
            <Upload className="size-4 shrink-0 text-zinc-500" aria-hidden />
            <span>Selecionar arquivo</span>
          </label>
        )}
        <p className="text-xs text-zinc-500">Tamanho máximo: 10MB</p>
        <FieldError message={errors.anexo?.message} />
      </div>

      {submitError && (
        <p className="text-sm text-red-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-100 px-6 text-sm font-medium text-zinc-950 transition-colors duration-300 ease-in-out hover:bg-zinc-200 active:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <LoaderCircleIcon className="size-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="size-4" aria-hidden />
            Enviar e-mail
          </>
        )}
      </button>
    </form>
  )
}
