import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
  }
>

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-canvas shadow-[0_10px_30px_rgba(147,226,186,0.18)] hover:bg-accent-strong',
  secondary: 'border border-line bg-elevated text-ink hover:border-line-strong hover:bg-surface',
  ghost: 'text-muted hover:bg-white/5 hover:text-ink',
}

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
