'use client'

/**
 * ============================================================================
 * COMPONENTE SCANNER - Redesign Fase 4
 * ============================================================================
 *
 * Fluxo Visual: IDLE → SCANNING → SUCCESS
 * Estética: Soft/Minimal com foco no conteúdo
 * ============================================================================
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

// Constantes para os estados/telas do app
const SCREENS = {
  HOME: 'home',
  SCANNING: 'scanning',
  RESULT: 'result'
}

// Mensagens de erro amigáveis em português
const ERROR_MESSAGES = {
  CAMERA_NOT_FOUND: 'Câmera não encontrada. Verifique se seu dispositivo possui câmera.',
  PERMISSION_DENIED: 'Acesso à câmera negado. Permita o acesso nas configurações do navegador.',
  HTTPS_REQUIRED: 'Câmera requer conexão segura (HTTPS).',
  SCANNER_ERROR: 'Erro ao iniciar scanner. Tente novamente.',
  CLIPBOARD_ERROR: 'Não foi possível copiar. Use o botão abaixo.',
  GENERIC: 'Ocorreu um erro. Tente novamente.'
}

// Ícone de QR Code
function QRCodeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  )
}

// Ícone de Câmera
function CameraIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// Ícone de Check
function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Ícone de Copiar
function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

// Ícone de Refresh
function RefreshIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

// Ícone de Link
function LinkIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

// Ícone de Home
function HomeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export default function Scanner() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME)
  const [scannedResult, setScannedResult] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessEffect, setShowSuccessEffect] = useState(false)

  const scannerRef = useRef(null)
  const scannerElementId = 'qr-reader'

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(true)
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
      setTimeout(() => setCopyFeedback(false), 2500)
      return true
    } catch (err) {
      console.error('Clipboard error:', err)
      setError(ERROR_MESSAGES.CLIPBOARD_ERROR)
      return false
    }
  }, [])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const isScanning = scannerRef.current.isScanning
        if (isScanning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch (err) {
        console.error('Erro ao parar scanner:', err)
      }
      scannerRef.current = null
    }
  }, [])

  const onScanSuccess = useCallback(async (decodedText) => {
    console.log('Código detectado:', decodedText)

    await stopScanner()

    // Mostrar efeito de sucesso
    setShowSuccessEffect(true)
    setTimeout(() => setShowSuccessEffect(false), 600)

    setScannedResult(decodedText)
    setCurrentScreen(SCREENS.RESULT)

    await copyToClipboard(decodedText)

    // Beep sonoro
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.value = 0.2

      oscillator.start()
      setTimeout(() => oscillator.stop(), 100)
    } catch (e) {
      // Ignora se áudio não funcionar
    }
  }, [stopScanner, copyToClipboard])

  const startScanner = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('HTTPS_REQUIRED')
      }

      await stopScanner()

      scannerRef.current = new Html5Qrcode(scannerElementId)

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      setCurrentScreen(SCREENS.SCANNING)

      await new Promise(resolve => setTimeout(resolve, 100))

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        onScanSuccess,
        () => {}
      )

    } catch (err) {
      console.error('Erro ao iniciar scanner:', err)

      let errorMessage = ERROR_MESSAGES.GENERIC

      if (err.message === 'HTTPS_REQUIRED') {
        errorMessage = ERROR_MESSAGES.HTTPS_REQUIRED
      } else if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMessage = ERROR_MESSAGES.PERMISSION_DENIED
      } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
        errorMessage = ERROR_MESSAGES.CAMERA_NOT_FOUND
      }

      setError(errorMessage)
      setCurrentScreen(SCREENS.HOME)
      await stopScanner()

    } finally {
      setIsLoading(false)
    }
  }, [stopScanner, onScanSuccess])

  const goHome = useCallback(async () => {
    await stopScanner()
    setCurrentScreen(SCREENS.HOME)
    setScannedResult('')
    setError(null)
    setCopyFeedback(false)
  }, [stopScanner])

  // Detecta se é uma URL
  const isUrl = (text) => {
    try {
      new URL(text)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  return (
    <div className="scanner-bg-subtle min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md scanner-stagger-children">

        {/* HEADER */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-scanner-accent to-teal-500 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 20px -5px rgba(34, 211, 238, 0.3)' }}>
              <QRCodeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-scanner-text tracking-tight">
                Scanner
              </h1>
              <p className="text-scanner-muted text-xs tracking-wide uppercase">
                QR Code & Barras
              </p>
            </div>
          </div>
        </header>

        {/* CARD PRINCIPAL */}
        <div className="scanner-card p-6 rounded-2xl">

          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-scanner-error/10 border border-scanner-error/20 scanner-animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-scanner-error/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-scanner-error text-xs">!</span>
                </div>
                <div>
                  <p className="text-scanner-error text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-scanner-muted text-xs mt-2 hover:text-scanner-text transition-colors"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TELA HOME - IDLE */}
          {currentScreen === SCREENS.HOME && (
            <div className="flex flex-col items-center py-10 scanner-animate-fade-in">
              {/* Ícone central com glow */}
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 rounded-full bg-scanner-accent/10 animate-pulse" />
                <div className="relative w-full h-full rounded-full bg-scanner-surface border border-scanner-border flex items-center justify-center">
                  <QRCodeIcon className="w-14 h-14 text-scanner-accent" />
                </div>
              </div>

              {/* Botão SCAN principal */}
              <button
                onClick={startScanner}
                disabled={isLoading}
                className="scanner-btn scanner-btn-primary px-10 py-4 text-lg font-semibold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <>
                    <CameraIcon className="w-5 h-5" />
                    <span>ESCANEAR</span>
                  </>
                )}
              </button>

              <p className="text-scanner-muted text-sm mt-6 text-center">
                Aponte a câmera para um código
              </p>
            </div>
          )}

          {/* TELA SCANNING */}
          {currentScreen === SCREENS.SCANNING && (
            <div className="scanner-animate-fade-in">
              {/* Viewfinder com cantos animados */}
              <div className="scanner-viewfinder relative rounded-2xl overflow-hidden scanner-state-scanning">
                {/* Cantos decorativos */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-scanner-accent rounded-tl-lg z-10 animate-pulse" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-scanner-accent rounded-tr-lg z-10 animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-scanner-accent rounded-bl-lg z-10 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-scanner-accent rounded-br-lg z-10 animate-pulse" style={{ animationDelay: '0.3s' }} />

                {/* Container do scanner */}
                <div
                  id={scannerElementId}
                  className="w-full aspect-square bg-black"
                />

                {/* Linha de scan animada */}
                <div className="scanner-scanline" />
              </div>

              <p className="text-scanner-accent text-center mt-4 text-sm animate-pulse">
                Buscando código...
              </p>

              <button
                onClick={goHome}
                className="scanner-btn scanner-btn-ghost w-full mt-6"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* TELA RESULTADO - SUCCESS */}
          {currentScreen === SCREENS.RESULT && (
            <div className="scanner-animate-result">
              {/* Ícone de sucesso com efeito */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Partículas de sucesso */}
                  {showSuccessEffect && (
                    <div className="scanner-particles">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="scanner-particle" style={{ left: '50%', top: '50%', marginLeft: '-3px', marginTop: '-3px' }} />
                      ))}
                    </div>
                  )}
                  {/* Anel de sucesso */}
                  <div className="w-16 h-16 rounded-full bg-scanner-success/20 flex items-center justify-center scanner-animate-code-glow">
                    <CheckIcon className="w-8 h-8 text-scanner-success" />
                  </div>
                </div>
              </div>

              <h2 className="text-scanner-text text-center font-medium mb-1">
                Código Detectado
              </h2>
              <p className="text-scanner-muted text-center text-sm mb-6">
                {isUrl(scannedResult) ? 'URL detectada' : 'Texto copiado automaticamente'}
              </p>

              {/* Resultado com estilo */}
              <div className="scanner-result-card relative p-4 rounded-xl mb-6">
                <textarea
                  readOnly
                  value={scannedResult}
                  onClick={(e) => e.target.select()}
                  className="w-full bg-transparent text-scanner-text scanner-result resize-none focus:outline-none cursor-text selection:bg-scanner-accent/30"
                  rows={3}
                />

                {copyFeedback && (
                  <div className="absolute -top-3 right-3 px-3 py-1 bg-scanner-success text-black text-xs font-bold rounded-full shadow-lg">
                    Copiado!
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => copyToClipboard(scannedResult)}
                  className="scanner-btn-icon flex-1 h-12 rounded-xl"
                  title="Copiar"
                >
                  <CopyIcon className="w-5 h-5" />
                </button>

                {isUrl(scannedResult) && (
                  <a
                    href={scannedResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scanner-btn-icon flex-1 h-12 rounded-xl"
                    title="Abrir link"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </a>
                )}

                <button
                  onClick={startScanner}
                  disabled={isLoading}
                  className="scanner-btn-icon flex-1 h-12 rounded-xl"
                  title="Nova leitura"
                >
                  <RefreshIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Botão principal de nova leitura */}
              <button
                onClick={startScanner}
                disabled={isLoading}
                className="scanner-btn scanner-btn-success w-full py-4 font-semibold flex items-center justify-center gap-2"
              >
                <CameraIcon className="w-5 h-5" />
                Nova Leitura
              </button>

              <button
                onClick={goHome}
                className="w-full mt-3 py-2 text-scanner-muted hover:text-scanner-text text-sm transition-colors flex items-center justify-center gap-2"
              >
                <HomeIcon className="w-4 h-4" />
                Voltar ao início
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="text-center mt-6">
          <p className="text-scanner-muted text-xs">
            Requer HTTPS para acesso à câmera
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1 text-scanner-text-secondary text-xs mt-2 hover:text-scanner-accent transition-colors"
          >
            ← Voltar ao MiniApps
          </a>
        </footer>
      </div>
    </div>
  )
}
