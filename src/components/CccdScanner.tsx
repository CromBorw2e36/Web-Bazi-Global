'use client'

import { useEffect, useRef, useState } from 'react'
import { parseCccdQr, type CccdData } from '@/lib/cccd'

export interface CccdScannerProps {
  onScan: (data: CccdData) => void
  onClose: () => void
}

export function CccdScanner({ onScan, onClose }: CccdScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Đang quét...')
  // Using ref to store scanner instance to avoid type issues with dynamic import
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    let active = true

    async function initScanner() {
      try {
        const QrScannerLib = (await import('qr-scanner')).default
        
        if (!videoRef.current || !active) return

        const scanner = new QrScannerLib(
          videoRef.current,
          (result: { data: string }) => {
            const parsed = parseCccdQr(result.data)
            if ('error' in parsed) {
              showError(parsed.error)
            } else {
              if (active) {
                scanner.stop()
                onScan(parsed)
              }
            }
          },
          { returnDetailedScanResult: true, highlightScanRegion: true, highlightCodeOutline: true }
        )

        scannerRef.current = scanner

        try {
          await scanner.start()
        } catch (err) {
          if (active) {
            showError('Không thể truy cập camera. Vui lòng cấp quyền hoặc chọn ảnh.')
            setStatus('')
          }
        }
      } catch (err) {
        if (active) {
          showError('Không thể tải thư viện quét mã QR.')
        }
      }
    }

    initScanner()

    return () => {
      active = false
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current.destroy()
      }
    }
  }, [onScan])

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => {
      setError(null)
    }, 4000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const QrScannerLib = (await import('qr-scanner')).default
      const result = await QrScannerLib.scanImage(file, { returnDetailedScanResult: true })
      
      const parsed = parseCccdQr(result.data)
      if ('error' in parsed) {
        showError(parsed.error)
      } else {
        onScan(parsed)
      }
    } catch (err) {
      showError('Không tìm thấy hoặc không thể đọc mã QR từ ảnh này.')
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
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
          📋 <strong className="font-semibold text-ink">Cam kết bảo mật:</strong> Thông tin từ căn cước công dân chỉ được sử dụng để lập lá số Bát Tự (xem tử vi). Mã QR được xử lý hoàn toàn trên thiết bị của bạn — không gửi lên máy chủ, không chia sẻ cho bên thứ ba.
        </div>

        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-seal bg-black">
          <video 
            ref={videoRef} 
            className="size-full object-cover"
          />
          {status && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="animate-pulse text-sm font-medium text-white">{status}</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="mb-4 rounded-seal border border-fire/40 bg-fire/5 px-3 py-2 text-sm text-fire">
            {error}
          </div>
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
}
