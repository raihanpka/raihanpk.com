'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PiX, PiFileText, PiDownloadSimple, PiCopy, PiCheck, PiArrowSquareOut } from 'react-icons/pi'
import { cn } from '@/lib/utils'
import '@/styles/arrow-fill-button.css'

interface ResumeModalProps {
  className?: string
}

export default function ResumeModal({ className }: ResumeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(window.location.origin + '/static/resume.pdf')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Obsidian-style Arrow Fill Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn('obsidian-arrow-fill-btn font-mono', className)}
        aria-label="Open Resume Preview"
        style={{
          '--btn-bg': 'hsl(var(--secondary))',
          '--btn-text': 'hsl(var(--secondary-foreground))',
          '--btn-fill-bg': 'hsl(var(--primary))',
          '--btn-fill-text': 'hsl(var(--primary-foreground))',
          '--btn-fill-bg-hover': 'hsl(var(--primary))',
          '--btn-fill-text-hover': 'hsl(var(--primary-foreground))',
          '--btn-arrow': 'hsl(var(--primary-foreground))',
          '--btn-arrow-hover': 'hsl(var(--primary-foreground))',
        } as React.CSSProperties}
      >
        <span className="obsidian-arrow-fill-btn__text flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          CV / Resume
        </span>
        <div aria-hidden="true" className="obsidian-arrow-fill-btn__circle">
          <div className="obsidian-arrow-fill-btn__circle-text">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
              CV / Resume
            </span>
            <svg
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="obsidian-arrow-fill-btn__icon"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 0L4.125 0.875L7.625 4.375L0 4.375L0 5.625Z"
                className="obsidian-arrow-fill-btn__path"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 0L4.125 0.875L7.625 4.375L0 4.375L0 5.625Z"
                className="obsidian-arrow-fill-btn__path"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Liquid Glass Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with strong blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/70 backdrop-blur-xl"
            />

            {/* Dialog Card with Liquid Glass specular highlights */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-background/80 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl"
            >
              {/* Top Specular Edge */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <PiFileText className="size-5 text-foreground" />
                    <h3 className="font-mono text-lg font-bold text-foreground">Curriculum Vitae</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Raihan Putra Kirana / Technical Profile & Track Record
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Close modal"
                >
                  <PiX className="size-4" />
                </button>
              </div>

              {/* Quick Spec Sheet Summary */}
              <div className="py-4 space-y-3 font-mono text-xs">
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Focus</span>
                  <span className="col-span-2 text-foreground font-semibold">Software Engineering & AI Systems</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Education</span>
                  <span className="col-span-2 text-foreground">IPB University, Computer Science (3rd Year)</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Podiums</span>
                  <span className="col-span-2 text-foreground">Multiple National Hackathon Top 3 & Finalist</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40">
                  <span className="text-muted-foreground">Status</span>
                  <span className="col-span-2 text-emerald-500 font-medium flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Open to Engineering Roles (Summer/FT)
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground hover:bg-secondary transition-colors"
                >
                  {copied ? <PiCheck className="size-3.5 text-emerald-500" /> : <PiCopy className="size-3.5" />}
                  {copied ? 'Link Copied' : 'Copy Link'}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href="/static/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-mono text-foreground hover:bg-accent transition-colors"
                  >
                    <PiArrowSquareOut className="size-3.5" />
                    Open PDF
                  </a>
                  <a
                    href="/static/resume.pdf"
                    download="Raihan_Putra_Kirana_Resume.pdf"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-xs font-mono hover:opacity-90 transition-opacity"
                  >
                    <PiDownloadSimple className="size-3.5" />
                    Download
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
