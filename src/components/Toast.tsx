import { useAppStore } from '../store/useAppStore'

export function Toast() {
  const toastShow = useAppStore((s) => s.toastShow)
  const toastText = useAppStore((s) => s.toast)
  if (!toastShow) return null
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 120, display: 'flex', alignItems: 'center', gap: 11, padding: '12px 18px', background: 'var(--toast)', border: '1px solid rgba(var(--sf-rgb),.12)', borderRadius: 12, boxShadow: '0 22px 48px -20px rgba(0,0,0,.55),0 1px 0 rgba(var(--sf-rgb),.08) inset', fontSize: 14, color: '#fff', animation: 'toastIn .2s cubic-bezier(.2,.8,.3,1)' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B75C' }} />
      {toastText}
    </div>
  )
}
