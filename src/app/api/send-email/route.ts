import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

import {
  sendEmailApiSchema,
  validateAttachment,
} from "@/lib/schemas/send-email-api"

function getSmtpConfig() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error(
      "Credenciais SMTP não configuradas. Defina SMTP_USER e SMTP_PASS no .env.local",
    )
  }

  return {
    user,
    pass,
    from: process.env.SMTP_FROM ?? user,
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const parsed = sendEmailApiSchema.safeParse({
      nome: formData.get("nome"),
      contato: formData.get("contato"),
      assunto: formData.get("assunto"),
      mensagem: formData.get("mensagem") || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const attachmentField = formData.get("anexo")
    const attachmentFile =
      attachmentField instanceof File ? attachmentField : null
    const attachmentValidation = validateAttachment(attachmentFile)

    if (!attachmentValidation.valid) {
      return NextResponse.json(
        { error: attachmentValidation.error },
        { status: 400 },
      )
    }

    const { user, pass, from } = getSmtpConfig()
    const { nome, contato, assunto, mensagem } = parsed.data

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_PORT !== "587",
      auth: { user, pass },
    })

    const attachments = attachmentValidation.file
      ? [
          {
            filename: attachmentValidation.file.name,
            content: Buffer.from(await attachmentValidation.file.arrayBuffer()),
          },
        ]
      : []

    const textBody = [
      `Nome: ${nome}`,
      `E-mail: ${[contato]}`,
      `Assunto: ${assunto}`,
      "",
      mensagem ? `Mensagem:\n${mensagem}` : "Mensagem: (não informada)",
    ].join("\n")

    await transporter.sendMail({
      from,
      to: `${contato}`,
      replyTo: from,
      subject: `${assunto}`,
      text: textBody,
      html: textBody.replace(/\n/g, "<br>"),
      attachments,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error)

    const message =
      error instanceof Error ? error.message : "Erro ao enviar e-mail"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
