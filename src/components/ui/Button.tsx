/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import Link from 'next/link'

export function Button({
  children,
  href,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
}: {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 font-medium transition-all rounded-md text-sm tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-xs'
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-sm active:translate-y-px',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:translate-y-px',
    outline: 'border border-stone-300 bg-transparent hover:bg-stone-100 hover:text-stone-900 text-stone-700 active:translate-y-px',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-700 active:translate-y-px',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm active:translate-y-px',
  }

  const classes = `${baseStyles} ${variants[variant]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
