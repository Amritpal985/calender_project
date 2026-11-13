import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="loader-screen">
      <Loader2 className="spin" size={26} />
      <span>{label}</span>
    </div>
  )
}
