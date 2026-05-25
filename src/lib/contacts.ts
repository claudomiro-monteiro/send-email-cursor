export const CONTACT_OPTIONS = [
  { email: "claudomiromonteiro@gmail.com", name: "Claudomiro" },
  { email: "lcbrj@terra.com.br", name: "Contador" },
  { email: "pedidosmarju@gmail.com", name: "Marju Confecções" },
] as const

export type ContactEmail = (typeof CONTACT_OPTIONS)[number]["email"]

export function getContactName(email: string) {
  return (
    CONTACT_OPTIONS.find((contact) => contact.email === email)?.name ?? email
  )
}
