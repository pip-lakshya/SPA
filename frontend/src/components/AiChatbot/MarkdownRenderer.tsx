import { useState } from "react"
import { Check, Copy } from "lucide-react"

type Props = {
  content: string
}

export default function MarkdownRenderer({ content }: Props) {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  // Parse code blocks vs regular paragraphs
  const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g)

  return (
    <div className="space-y-2.5 text-[14px] leading-relaxed text-slate-800 dark:text-slate-100 font-normal">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n")
          const language = lines[0].trim() || "code"
          const code = lines.slice(1).join("\n") || lines[0]
          const codeId = `code-${index}`

          return (
            <div key={index} className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-slate-400">
                <span className="font-mono text-[11px] uppercase tracking-wider">{language}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(code, codeId)}
                  className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  {copiedCodeId === codeId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3.5 font-mono text-slate-200">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Render regular markdown lines
        const lines = part.split("\n")
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={lineIdx} className="h-1.5" />

              // Headings
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lineIdx} className="pt-2 font-bold text-slate-900 dark:text-white text-[15px] flex items-center gap-1.5">
                    {renderFormattedInline(trimmed.slice(4))}
                  </h4>
                )
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lineIdx} className="pt-2 font-bold text-indigo-600 dark:text-indigo-400 text-base flex items-center gap-1.5">
                    {renderFormattedInline(trimmed.slice(3))}
                  </h3>
                )
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lineIdx} className="pt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                    {renderFormattedInline(trimmed.slice(2))}
                  </h2>
                )
              }

              // Bullet points
              if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-1.5 text-slate-700 dark:text-slate-200">
                    <span className="text-indigo-500 font-bold mt-1 text-xs">•</span>
                    <span className="flex-1">{renderFormattedInline(trimmed.slice(2))}</span>
                  </div>
                )
              }

              // Numbered list (e.g. 1. 2. etc)
              const numberMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
              if (numberMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-1.5 text-slate-700 dark:text-slate-200">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {numberMatch[1]}
                    </span>
                    <span className="flex-1 pt-0.5">{renderFormattedInline(numberMatch[2])}</span>
                  </div>
                )
              }

              // Normal text
              return (
                <p key={lineIdx} className="text-slate-700 dark:text-slate-200">
                  {renderFormattedInline(trimmed)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function renderFormattedInline(text: string) {
  // Process inline code `code` and bold **bold**
  const parts = text.split(/(\`[^\`]+\`|\*\*[^*]+\*\*)/g)

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-medium text-indigo-600 dark:bg-slate-800 dark:text-indigo-300"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
