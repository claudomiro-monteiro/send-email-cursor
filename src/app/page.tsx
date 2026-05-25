import { Moon } from "lucide-react"

import { EmailForm } from "@/components/email-form"

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        <button
          type="button"
          className="absolute -top-14 right-0 flex size-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-sm"
          aria-label="Alternar tema"
        >
          <Moon className="size-4" aria-hidden />
        </button>

        <div className="flex w-full flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-50 shadow-sm">
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 pt-6">
            <h1 className="text-xl font-semibold leading-none">
              Enviar E-mail
            </h1>
            <p className="text-sm text-zinc-400">
              Preencha o formulário abaixo para entrar em contato
            </p>
          </div>

          <div className="px-6 pb-6">
            <EmailForm />
          </div>
        </div>
      </div>
    </div>
  )
}
