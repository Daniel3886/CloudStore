import { redirect } from "next/navigation"

export default function Home() {
  // In a real app, you'd check authentication here
  // For now, we'll just redirect to the files page
  redirect("/files")
}
