'use client'

/**
 * ============================================================================
 * COMPONENTE SCANNER - O CORAÇÃO DO APLICATIVO
 * ============================================================================
 * 
 * 'use client' no topo indica que este é um Client Component.
 * 
 * EXPLICAÇÃO PARA DESENVOLVEDOR JÚNIOR:
 * 
 * No Next.js 13+, existem dois tipos de componentes:
 * 
 * 1. SERVER COMPONENTS (padrão): Renderizam no servidor, não têm interatividade
 * 2. CLIENT COMPONENTS: Renderizam no navegador, podem usar hooks, eventos, etc.
 * 
 * Como nosso Scanner usa câmera, eventos de clique e hooks do React,
 * PRECISA ser um Client Component, por isso o 'use client'.
 * ============================================================================
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { createWorker } from 'tesseract.js'

// Constantes para os estados/telas do app
const SCREENS = {
  HOME: 'home',
  SCANNING: 'scanning',
  RESULT: 'result',
  OCR_CAMERA: 'ocr_camera',
  OCR_PROCESSING: 'ocr_processing'
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

export default function Scanner() {
  // =====================================================================
  // ESTADOS (useState)
  // Cada useState retorna [valor, função_para_mudar_valor]
  // =====================================================================
  
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME)
  const [scannedResult, setScannedResult] = useState('')
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isHardwareZoom, setIsHardwareZoom] = useState(false)
  
  // =====================================================================
  // REFS (useRef)
  // Guardam valores que persistem entre renderizações sem causar re-render
  // =====================================================================
  
  const scannerRef = useRef(null)
  const ocrVideoRef = useRef(null)
  const scannerElementId = 'qr-reader'

  // =====================================================================
  // FUNÇÃO: Copiar para Clipboard
  // =====================================================================
  
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyFeedback(true)
      
      // Vibração como feedback (se disponível no dispositivo)
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

  // =====================================================================
  // FUNÇÃO: Parar OCR (libera câmera)
  // =====================================================================
  
  const stopOcr = useCallback(() => {
    if (ocrVideoRef.current && ocrVideoRef.current.srcObject) {
      const tracks = ocrVideoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      ocrVideoRef.current.srcObject = null
    }
  }, [])

  // =====================================================================
  // FUNÇÃO: Parar o Scanner (libera a câmera)
  // =====================================================================
  
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

  // =====================================================================
  // FUNÇÃO: Quando um código é detectado com sucesso
  // =====================================================================
  
  const onScanSuccess = useCallback(async (decodedText) => {
    console.log('Código detectado:', decodedText)
    
    await stopScanner()
    
    setScannedResult(decodedText)
    setCurrentScreen(SCREENS.RESULT)
    
    // Copia automaticamente
    await copyToClipboard(decodedText)
    
    // Beep sonoro usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start()
      setTimeout(() => oscillator.stop(), 150)
    } catch (e) {
      // Ignora se áudio não funcionar
    }
  }, [stopScanner, copyToClipboard])

  // =====================================================================
  // FUNÇÃO: Ciclar Zoom (2x -> 4x -> ... -> 16x -> 2x)
  // =====================================================================
  
  const cycleZoom = useCallback(async () => {
    // Começa em 2, incrementa de 2 em 2 até 16
    const nextZoom = zoomLevel >= 16 ? 2 : zoomLevel + 2
    
    // Tenta aplicar hardware zoom primeiro se possível
    if (ocrVideoRef.current && ocrVideoRef.current.srcObject) {
      const track = ocrVideoRef.current.srcObject.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if (capabilities.zoom) {
        try {
          // Tenta aplicar o zoom solicitado no hardware
          // Se o hardware suportar apenas parcialmente (ex: máx 10x), 
          // aplicamos o máximo possível e completamos com digital depois?
          // Simplificação: Se hardware suportar o ALVO exato, usa hardware.
          // Caso contrário, usa fallback para garantir consistência visual.
          
          if (capabilities.zoom.max >= nextZoom) {
            await track.applyConstraints({
              advanced: [{ zoom: nextZoom }]
            })
            setIsHardwareZoom(true)
            setZoomLevel(nextZoom)
            return
          }
        } catch (e) {
          console.warn('Falha ao aplicar zoom de hardware:', e)
        }
      }
    }
    
    // Fallback: Zoom puramente digital (recorte + scale)
    // Se o hardware não suporta o nível desejado, reseta o hardware para 1x (ou min)
    // e aplica tudo via software para garantir que o recorte corresponda
    try {
      if (ocrVideoRef.current && ocrVideoRef.current.srcObject) {
        const track = ocrVideoRef.current.srcObject.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        if (capabilities.zoom) {
            await track.applyConstraints({
                advanced: [{ zoom: 1 }]
            })
        }
      }
    } catch (e) { /* ignore */ }

    setIsHardwareZoom(false)
    setZoomLevel(nextZoom)
  }, [zoomLevel])

  // =====================================================================
  // FUNÇÃO: Iniciar OCR (Câmera)
  // =====================================================================
  
  const startOcr = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      await stopScanner()
      
      setCurrentScreen(SCREENS.OCR_CAMERA)
      // Pequeno delay para renderizar o elemento de vídeo
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      // Configurar Zoom Inicial (Tenta 2x)
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      let initialZoom = 2
      
      if (capabilities.zoom) {
        const maxZoom = capabilities.zoom.max || 1
        // Tenta zoom 2x ou o máximo disponível
        const targetZoom = Math.min(2, maxZoom)
        
        try {
          await track.applyConstraints({
            advanced: [{ zoom: targetZoom }]
          })
          
          const appliedZoom = track.getSettings().zoom
          if (appliedZoom && appliedZoom >= targetZoom) { // Verifica se aplicou MESMO
            setIsHardwareZoom(true)
            setZoomLevel(appliedZoom)
            initialZoom = appliedZoom
          } else {
            // Se o browser diz que suporta mas não aplica, ou aplica menos
            // Fallback para digital
            setIsHardwareZoom(false)
            setZoomLevel(2)
            initialZoom = 2
            // Tenta resetar hardware para 1x para garantir base limpa para digital
            await track.applyConstraints({ advanced: [{ zoom: 1 }] }).catch(() => {})
          }
        } catch (e) {
          console.warn('Erro ao aplicar zoom de hardware:', e)
          setIsHardwareZoom(false)
          setZoomLevel(2)
          initialZoom = 2
        }
      } else {
        // Fallback para zoom digital
        setIsHardwareZoom(false)
        setZoomLevel(2)
        initialZoom = 2
      }

      if (ocrVideoRef.current) {
        ocrVideoRef.current.srcObject = stream
        ocrVideoRef.current.play()
      }
    } catch (err) {
      console.error('Erro ao iniciar câmera OCR:', err)
      setError(ERROR_MESSAGES.GENERIC + ' (Câmera OCR)')
      setCurrentScreen(SCREENS.HOME)
    } finally {
      setIsLoading(false)
    }
  }, [stopScanner])

  // =====================================================================
  // FUNÇÃO: Capturar Foto e Processar OCR
  // =====================================================================
  
  const captureOcr = useCallback(async () => {
    if (!ocrVideoRef.current) return
    
    try {
      const video = ocrVideoRef.current
      const canvas = document.createElement('canvas')
      
      let sx, sy, sWidth, sHeight

      if (isHardwareZoom) {
        // Se o zoom é de hardware, a imagem já está ampliada
        // Capturamos a faixa central normalmente
        sWidth = video.videoWidth
        sHeight = video.videoHeight * 0.25
        sx = 0
        sy = (video.videoHeight - sHeight) / 2
      } else {
        // Zoom Digital
        // Precisamos capturar uma área menor correspondente ao zoom
        // Se zoomLevel é 4, capturamos 1/4 da largura
        // E 1/4 da altura da faixa visível
        
        sWidth = video.videoWidth / zoomLevel
        // A altura de captura também escala
        sHeight = (video.videoHeight * 0.25) / zoomLevel
        
        sx = (video.videoWidth - sWidth) / 2
        sy = (video.videoHeight - sHeight) / 2
      }
      
      canvas.width = video.videoWidth // Mantém alta resolução
      canvas.height = video.videoHeight * 0.25 // Mantém proporção da faixa
      
      const ctx = canvas.getContext('2d')
      
      // Melhora qualidade do redimensionamento para zoom digital
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      ctx.drawImage(
        video, 
        sx, sy, sWidth, sHeight,     // Source (área calculada)
        0, 0, canvas.width, canvas.height // Destination (tamanho total da faixa)
      )
      
      // Stop camera
      stopOcr()
      
      setCurrentScreen(SCREENS.OCR_PROCESSING)
      
      const worker = await createWorker('eng')
      
      // Configura whitelist para aceitar números e espaços
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789 ',
      })
      
      const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'))
      await worker.terminate()
      
      // Limpeza: Manter números e espaços
      const cleanedText = text.replace(/[^0-9\s]/g, '')
      
      setScannedResult(cleanedText || 'Nenhum número encontrado')
      setCurrentScreen(SCREENS.RESULT)
      
      if (cleanedText && cleanedText.trim().length > 0) {
        await copyToClipboard(cleanedText)
      }
      
    } catch (err) {
      console.error('Erro no OCR:', err)
      setError('Falha ao processar imagem. Tente novamente.')
      setCurrentScreen(SCREENS.HOME)
    }
  }, [stopOcr, copyToClipboard])

  // =====================================================================
  // FUNÇÃO: Iniciar o Scanner
  // =====================================================================
  
  const startScanner = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      // Verifica HTTPS (câmera só funciona em conexão segura ou localhost)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('HTTPS_REQUIRED')
      }
      
      await stopScanner()
      
      // Muda tela e aguarda renderização do container
      setCurrentScreen(SCREENS.SCANNING)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Verifica se o elemento existe antes de instanciar
      if (!document.getElementById(scannerElementId)) {
        throw new Error('Elemento do scanner não encontrado')
      }

      // Cria instância do scanner
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerElementId)
      }
      
      // Configuração
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }
      
      try {
        // Tenta iniciar com câmera traseira
        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          onScanSuccess,
          () => {} // Ignora erros por frame
        )
      } catch (startError) {
        console.warn('Erro ao iniciar com câmera traseira, tentando câmera padrão...', startError)
        // Fallback: Tenta iniciar sem preferência de câmera
        await scannerRef.current.start(
          {}, 
          config,
          onScanSuccess,
          () => {}
        )
      }
      
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err)
      
      let errorMessage = ERROR_MESSAGES.GENERIC
      
      if (err.message === 'HTTPS_REQUIRED') {
        errorMessage = ERROR_MESSAGES.HTTPS_REQUIRED
      } else if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        errorMessage = ERROR_MESSAGES.PERMISSION_DENIED
      } else if (err.name === 'NotFoundError' || err.message?.includes('not found')) {
        errorMessage = ERROR_MESSAGES.CAMERA_NOT_FOUND
      } else {
        // Inclui mensagem técnica para debug se não for um erro mapeado
        errorMessage = `${ERROR_MESSAGES.GENERIC} (${err.message || 'Erro desconhecido'})`
      }
      
      setError(errorMessage)
      // Não volta para HOME imediatamente para que o usuário possa ler o erro
      // Mas fazemos cleanup do scanner
      await stopScanner()
      
    } finally {
      setIsLoading(false)
    }
  }, [stopScanner, onScanSuccess])

  // =====================================================================
  // FUNÇÃO: Voltar para Home
  // =====================================================================
  
  const goHome = useCallback(async () => {
    await stopScanner()
    stopOcr()
    setCurrentScreen(SCREENS.HOME)
    setScannedResult('')
    setError(null)
    setCopyFeedback(false)
  }, [stopScanner, stopOcr])

  // =====================================================================
  // EFFECT: Cleanup ao desmontar componente
  // =====================================================================
  
  useEffect(() => {
    return () => {
      stopScanner()
      stopOcr()
    }
  }, [stopScanner, stopOcr])

  // =====================================================================
  // RENDERIZAÇÃO (JSX)
  // =====================================================================
  
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4 relative">
            <Link 
              href="/"
              className="absolute left-0 p-2 text-neutral-500 hover:text-white transition-colors"
              title="Voltar ao Menu Principal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="square" 
                strokeLinejoin="miter" 
                strokeWidth={2} 
                d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm12-12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-8 0h2v2h-2v-2zm0-4h2v2h-2v-2z" 
              />
            </svg>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">
              Scan<span className="text-neutral-500">QR</span>Code<span className="text-neutral-500">Bar</span>
            </h1>
          </div>
          <p className="text-neutral-500 text-sm tracking-wide uppercase">
            Scanner de QR Code e Código de Barras
          </p>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="bg-black border border-neutral-800 p-8">
          
          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-200 text-sm font-bold uppercase">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 text-xs mt-2 hover:text-white uppercase font-bold transition-colors"
                >
                  Dispensar
                </button>
              </div>
            </div>
          )}

          {/* TELA HOME */}
          {currentScreen === SCREENS.HOME && (
            <div className="flex flex-col items-center py-8 animate-fadeIn">
              <div className="w-40 h-40 mb-8 border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                <svg className="w-20 h-20 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              
              <button
                onClick={startScanner}
                disabled={isLoading}
                className="group w-full relative px-8 py-6 bg-white hover:bg-neutral-200 text-black font-bold text-xl uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-white"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Iniciando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    SCAN
                  </span>
                )}
              </button>

              <div className="w-full flex justify-center mt-4">
                 <button
                  onClick={startOcr}
                  disabled={isLoading}
                  className="w-full px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-lg border border-neutral-800 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wide"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  OCR / Foto
                </button>
              </div>
              
              <p className="text-neutral-600 text-xs mt-8 text-center uppercase tracking-widest">
                Aponte a câmera para um QR Code ou código de barras
              </p>
            </div>
          )}

          {/* TELA OCR CAMERA */}
          {currentScreen === SCREENS.OCR_CAMERA && (
            <div className="animate-fadeIn">
              <p className="text-neutral-500 text-center mb-4 text-xs uppercase tracking-widest">
                Centralize o texto na área abaixo
              </p>
              <div className="relative overflow-hidden bg-black h-32 md:h-40 mb-6 border-2 border-white">
                <video
                  ref={ocrVideoRef}
                  autoPlay
                  playsInline
                  style={{ 
                    transform: !isHardwareZoom ? `scale(${zoomLevel})` : 'none',
                    transformOrigin: 'center center'
                  }}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                {/* Linha central para guia */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50 w-full" />
                
                {/* Botão de Zoom Flutuante */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    cycleZoom()
                  }}
                  className="absolute bottom-2 right-2 bg-black text-white border border-white px-2 py-1 font-mono text-xs font-bold hover:bg-neutral-900 transition-all flex items-center gap-1 z-10"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  {zoomLevel}x
                </button>
              </div>
              
              <button
                onClick={captureOcr}
                className="w-full py-4 bg-white hover:bg-neutral-200 text-black font-bold text-xl transition-all flex items-center justify-center gap-2 mb-3 uppercase tracking-wide"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capturar e Ler
              </button>
              
              <button
                onClick={goHome}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-medium transition-colors uppercase text-sm border border-neutral-800"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* TELA OCR PROCESSING */}
          {currentScreen === SCREENS.OCR_PROCESSING && (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-neutral-800"></div>
                <div className="absolute inset-0 border-4 border-white border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wider">Processando...</h3>
              <p className="text-neutral-500 text-sm text-center max-w-xs">
                Utilizando inteligência artificial para ler o texto.
              </p>
            </div>
          )}

          {/* TELA SCANNING */}
          {currentScreen === SCREENS.SCANNING && (
            <div className="animate-fadeIn">
              <div className="relative">
                {/* Bordas decorativas */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white z-10" />
                
                {/* Container do scanner */}
                <div 
                  id={scannerElementId}
                  className="w-full aspect-square bg-black overflow-hidden"
                />
                
                {/* Linha de scan animada */}
                <div className="absolute inset-x-4 top-1/2 h-px bg-white animate-scanLine opacity-50" />
              </div>
              
              <p className="text-neutral-500 text-center mt-6 text-xs uppercase tracking-widest animate-pulse">
                Posicione o código na área demarcada
              </p>
              
              <button
                onClick={goHome}
                className="w-full mt-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-medium transition-colors uppercase text-sm border border-neutral-800"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* TELA RESULTADO */}
          {currentScreen === SCREENS.RESULT && (
            <div className="animate-fadeIn">
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-white flex items-center justify-center">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-white text-center font-bold text-xl uppercase tracking-wider mb-6">
                Código Detectado
              </h2>
              
              <div className="relative mb-6">
                <textarea
                  readOnly
                  value={scannedResult}
                  onClick={(e) => e.target.select()}
                  className="w-full p-4 bg-neutral-900 border border-neutral-800 text-white font-mono text-lg resize-none focus:ring-1 focus:ring-white focus:outline-none cursor-text selection:bg-white selection:text-black"
                  rows={4}
                />
                
                {copyFeedback && (
                  <div className="absolute -top-3 right-3 px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg">
                    Copiado
                  </div>
                )}
              </div>
              
              <button
                onClick={() => copyToClipboard(scannedResult)}
                className="w-full mb-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors flex items-center justify-center gap-2 border border-neutral-700 uppercase tracking-wide text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Novamente
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={goHome}
                  className="py-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-medium transition-colors uppercase text-sm border border-neutral-800"
                >
                  Início
                </button>
                <button
                  onClick={startScanner}
                  disabled={isLoading}
                  className="py-4 bg-white hover:bg-neutral-200 text-black font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scan
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* FOOTER */}
        <footer className="text-center mt-8 text-neutral-600 text-[10px] uppercase tracking-widest">
          <p>Requer HTTPS para acesso à câmera</p>
        </footer>
      </div>
    </div>
  )
}