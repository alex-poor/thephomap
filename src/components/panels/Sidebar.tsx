import { type ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function Sidebar({ open, onToggle, children }: SidebarProps) {
  return (
    <div
      className={`absolute left-0 top-0 z-10 flex h-full transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-80'
      }`}
    >
      {/* Sidebar panel */}
      <div className="h-full w-80 bg-white shadow-lg">
        <div className="flex h-full flex-col overflow-y-auto pt-2 pb-4">
          <div className="border-b border-pho-teal/30 px-4 pb-3">
            <img src="/thepho-logo.svg" alt="thePHO" className="h-12 w-full object-contain" />
          </div>
          <div className="flex flex-1 flex-col space-y-4 px-4 pt-4">{children}</div>
        </div>
      </div>

      {/* Toggle button — pinned to right edge of sidebar */}
      <button
        onClick={onToggle}
        className="mt-2 h-fit rounded-r-md bg-white p-1.5 shadow-md hover:bg-pho-light"
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? (
          <PanelLeftClose className="h-5 w-5 text-pho-navy" />
        ) : (
          <PanelLeftOpen className="h-5 w-5 text-pho-navy" />
        )}
      </button>
    </div>
  )
}
