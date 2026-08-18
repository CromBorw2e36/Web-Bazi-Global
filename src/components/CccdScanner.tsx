'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type QrScanner from 'qr-scanner'
import { parseCccdQr, type CccdData } from '@/lib/cccd'

export interface CccdScannerProps {
  onScan: (data: CccdData) => void
  onClose: () => void
}

/** A camera failure the user cannot retry away, and what to do about it. */
interface Fatal {
  title: string
  hint: string
}

/**
 * Why `getUserMedia` refused, in words the person holding the phone can act on.
 *
 * The browser's own messages are useless here ("Permission denied"), and the
 * fixes are genuinely different: a blocked permission is undone in site
 * settings, an occupied camera by closing the other app, an insecure origin
 * only by changing how the page is served.
 */
function explain(err: unknown): Fatal {
  // getUserMedia rejects with a DOMException, but qr-scanner throws the bare
  // string 'Camera not found.' when the browser exposes no mediaDevices at all.
  const name = err instanceof Error ? err.name : typeof err === 'string' ? err : ''

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return {
      title: 'Trình duyệt đã chặn quyền camera.',
      hint: 'Bấm vào biểu tượng ổ khoá trên thanh địa chỉ, bật lại quyền Camera rồi mở lại. Hoặc dùng nút "Chọn ảnh" bên dưới.',
    }
  }
  if (
    name === 'NotFoundError' ||
    name === 'OverconstrainedError' ||
    name === 'NotSupportedError' ||
    name === 'Camera not found.'
  ) {
    return {
      title: 'Không tìm thấy camera trên thiết bị này.',
      hint: 'Hãy chụp mã QR bằng điện thoại rồi dùng nút "Chọn ảnh" bên dưới.',
    }
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return {
      title: 'Camera đang được ứng dụng khác sử dụng.',
      hint: 'Đóng Zoom, Messenger hoặc ứng dụng camera đang mở rồi thử lại.',
    }
  }
  return {
    title: 'Không mở được camera.',
    hint: 'Thử lại, hoặc dùng nút "Chọn ảnh" bên dưới.',
  }
}

export function CccdScanner({ onScan, onClose }: CccdScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)

  const [ready, setReady] = useState(false)
  const [fatal, setFatal] = useState<Fatal | null>(null)
  /** Bad QR, wrong card, unreadable photo — worth retrying, so it self-clears. */
  const [notice, setNotice] = useState<string | null>(null)

  /*
    The parent passes a fresh arrow on every render. Held in a ref, so a parent
    re-render while the modal is open cannot tear the camera down and start it
    again — which is what an `onScan` effect dependency would do.
  */
  const onScanRef = useRef(onScan)
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const showNotice = useCallback((msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 4000)
  }, [])

  /*
    Attached to the <video> as a callback ref rather than driven by an effect.

    The element only exists once the portal has rendered, and the import of
    qr-scanner resolves from the module cache the second time the modal opens —
    fast enough to beat React's re-render. An effect that read a plain ref would
    therefore find `null` on every open after the first and bail out silently:
    camera dead, no error, "Đang quét…" forever. A callback ref cannot lose that
    race, because it fires with the node itself.
  */
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video || scannerRef.current) return

      let cancelled = false

      async function start() {
        // Chrome and Safari expose no camera at all outside a secure context,
        // which is what happens when the site is opened over http on a phone.
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          setFatal({
            title: 'Trình duyệt chỉ cho phép dùng camera trên kết nối bảo mật (HTTPS).',
            hint: 'Hãy mở trang bằng địa chỉ https:// (hoặc localhost), hoặc dùng nút "Chọn ảnh" bên dưới.',
          })
          return
        }

        try {
          const QrScannerLib = (await import('qr-scanner')).default
          if (cancelled) return

          const scanner = new QrScannerLib(
            video!,
            (result) => {
              const parsed = parseCccdQr(result.data)
              if ('error' in parsed) {
                showNotice(parsed.error)
                return
              }
              scanner.stop()
              onScanRef.current(parsed)
            },
            {
              returnDetailedScanResult: true,
              highlightScanRegion: true,
              highlightCodeOutline: true,
              // The card is held in front of the phone, not behind it.
              preferredCamera: 'environment',
            },
          )
          scannerRef.current = scanner

          if (cancelled) {
            scanner.destroy()
            return
          }

          await scanner.start()
          if (!cancelled) setReady(true)
        } catch (err) {
          if (!cancelled) setFatal(explain(err))
        }
      }

      start()

      // A callback ref's cleanup runs when the node detaches, which is exactly
      // when the camera should be released.
      return () => {
        cancelled = true
        scannerRef.current?.destroy()
        scannerRef.current = null
      }
    },
    [showNotice],
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const QrScannerLib = (await import('qr-scanner')).default
      const result = await QrScannerLib.scanImage(file, { returnDetailedScanResult: true })

      const parsed = parseCccdQr(result.data)
      if ('error' in parsed) {
        showNotice(parsed.error)
      } else {
        onScanRef.current(parsed)
      }
    } catch {
      showNotice('Không tìm thấy hoặc không đọc được mã QR trong ảnh này.')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /*
    Both call sites load this through `next/dynamic` with `ssr: false`, so the
    first render already happens in the browser and `document.body` is there to
    portal into. The guard is for anyone who imports it directly later; it is a
    plain check rather than a mounted flag, because a flag would mean the <video>
    is absent on the first render — and the camera setup would then race React's
    re-render to find it.
  */
  if (typeof document === 'undefined') return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quét CCCD"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[480px] rounded-seal border border-rule bg-paper p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-paper/80 text-ink hover:bg-rule"
          aria-label="Đóng"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-3 text-lg font-semibold text-ink">Quét CCCD</h2>

        <div className="mb-4 rounded-seal border border-rule bg-rule/30 p-3 text-sm text-ink-soft">
          📋 <strong className="font-semibold text-ink">Cam kết bảo mật:</strong> Thông tin từ căn cước công dân chỉ
          được sử dụng để lập lá số Bát Tự (xem tử vi). Mã QR được xử lý hoàn toàn trên thiết bị của bạn — không gửi
          lên máy chủ, không chia sẻ cho bên thứ ba.
        </div>

        {fatal ? (
          <div className="mb-4 rounded-seal border border-fire/40 bg-fire/5 px-3 py-3 text-sm">
            <p className="font-medium text-fire">{fatal.title}</p>
            <p className="mt-1 text-ink-soft">{fatal.hint}</p>
          </div>
        ) : (
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-seal bg-black">
            {/*
              `muted` and `playsInline` are what let iOS Safari play the stream
              in place instead of taking over the screen with the native player.
            */}
            <video ref={attachVideo} muted playsInline className="size-full object-cover" />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="animate-pulse text-sm font-medium text-white">Đang mở camera…</span>
              </div>
            )}
          </div>
        )}

        {notice ? (
          <div className="mb-4 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-sm text-fire">{notice}</div>
        ) : null}

        {ready && !fatal ? (
          <p className="mb-3 text-center text-sm text-ink-soft">
            Đưa mặt sau thẻ căn cước vào khung — mã QR nằm ở góc trên bên phải.
          </p>
        ) : null}

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-ink-faint">Hoặc chọn ảnh chứa mã QR</span>
          <label className="cursor-pointer rounded-seal border border-rule bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-rule-strong hover:bg-rule/30">
            Chọn ảnh
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
