import { type ReactElement } from 'react'

// Workspace glyphs (JSON braces / spreadsheet grid), matching the design.
export function wsIcon(id: string, size: number): ReactElement {
  const paths =
    id === 'json'
      ? [
          <path key="a" d="M8 4c-2 0-2 2-2 4 0 1.6-1 2-2 2 1 0 2 .4 2 2 0 2 0 4 2 4" />,
          <path key="b" d="M16 4c2 0 2 2 2 4 0 1.6 1 2 2 2-1 0-2 .4-2 2 0 2 0 4-2 4" />,
        ]
      : [
          <rect key="a" x={4} y={5} width={16} height={14} rx={1.6} />,
          <path key="b" d="M4 10h16M4 14.5h16M10 5v14" />,
        ]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  )
}

export function actionIcon(at: string, size: number): ReactElement {
  if (at === 'github')
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
      </svg>
    )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 13.2A8 8 0 1 1 10.8 3.5 6.3 6.3 0 0 0 20.5 13.2z" />
    </svg>
  )
}
