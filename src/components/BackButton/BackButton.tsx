import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import './BackButton.scss'

interface BackButtonProps {
  to?: string
  label?: string
}

export function BackButton({ to, label }: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button onClick={handleClick} className="back-button" aria-label="Go back">
      <ArrowLeft size={16} />
      {label && <span className="back-button-label">{label}</span>}
    </button>
  )
}
