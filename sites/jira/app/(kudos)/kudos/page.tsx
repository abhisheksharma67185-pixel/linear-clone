"use client"

import dynamic from "next/dynamic"

const KudosForm = dynamic(() => import("./kudos-form"), { ssr: false })

export default function KudosPage() {
  return <KudosForm />
}
