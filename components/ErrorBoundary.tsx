'use client'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error) { console.error('[ErrorBoundary]', error) }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-xl border border-red-500/20 p-4 text-sm text-red-400">
          Failed to load this section.
        </div>
      )
    }
    return this.props.children
  }
}
