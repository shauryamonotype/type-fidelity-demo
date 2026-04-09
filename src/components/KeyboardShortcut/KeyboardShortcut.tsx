import './KeyboardShortcut.css'

export interface KeyboardShortcutProps {
  /** Array of key labels to display, e.g. ['⌘', 'K'] or ['Esc'] */
  keys: string[]
  className?: string
}

export function KeyboardShortcut({ keys, className }: KeyboardShortcutProps) {
  return (
    <span className={`ks${className ? ` ${className}` : ''}`}>
      {keys.map((key, i) => (
        <span key={i} className="ks__key">{key}</span>
      ))}
    </span>
  )
}
