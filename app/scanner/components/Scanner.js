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
      
      // Configurar Zoom
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      const settings = track.getSettings()

      if (capabilities.zoom) {
        const maxZoom = capabilities.zoom.max || 1
        // Tenta zoom 4x ou o máximo disponível
        const targetZoom = Math.min(4, maxZoom)
        
        try {
          await track.applyConstraints({
            advanced: [{ zoom: targetZoom }]
          })
          
          const appliedZoom = track.getSettings().zoom
          if (appliedZoom && appliedZoom > 1) {
            setIsHardwareZoom(true)
            setZoomLevel(appliedZoom)
          } else {
            // Fallback se o browser disser que suporta mas não aplicar
            setIsHardwareZoom(false)
            setZoomLevel(4)
          }
        } catch (e) {
          console.warn('Erro ao aplicar zoom de hardware:', e)
          setIsHardwareZoom(false)
          setZoomLevel(4)
        }
      } else {
        // Fallback para zoom digital
        setIsHardwareZoom(false)
        setZoomLevel(4)
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
      const { data: { text } } = await worker.recognize(canvas.toDataURL('image/png'))
      await worker.terminate()
      
      setScannedResult(text)
      setCurrentScreen(SCREENS.RESULT)
      
      await copyToClipboard(text)
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg 
              className="w-10 h-10 text-emerald-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm12-12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 8h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-8 0h2v2h-2v-2zm0-4h2v2h-2v-2z" 
              />
            </svg>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Scan<span className="text-emerald-400">QR</span>Code<span className="text-amber-400">Bar</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Scanner de QR Code e Código de Barras
          </p>
        </header>

        {/* ÁREA DE CONTEÚDO */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-slate-700/50">
          
          {/* MENSAGEM DE ERRO */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400/70 text-xs mt-1 hover:text-red-300 transition-colors"
                >
                  Dispensar
                </button>
              </div>
            </div>
          )}

          {/* TELA HOME */}
          {currentScreen === SCREENS.HOME && (
            <div className="flex flex-col items-center py-12 animate-fadeIn">
              <div className="w-40 h-40 mb-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 flex items-center justify-center border-2 border-dashed border-slate-600">
                <svg className="w-20 h-20 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              
              <button
                onClick={startScanner}
                disabled={isLoading}
                className="group relative px-12 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-xl rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Iniciando...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <svg className="w-7 h-7 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    SCAN
                  </span>
                )}
              </button>

              <div className="w-full flex justify-center mt-6">
                 <button
                  onClick={startOcr}
                  disabled={isLoading}
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-lg rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  OCR / Foto
                </button>
              </div>
              
              <p className="text-slate-500 text-sm mt-6 text-center">
                Aponte a câmera para um QR Code<br/>ou código de barras
              </p>
            </div>
          )}

          {/* TELA OCR CAMERA */}
          {currentScreen === SCREENS.OCR_CAMERA && (
            <div className="animate-fadeIn">
              <p className="text-slate-400 text-center mb-4 text-sm">
                Centralize o texto na área abaixo
              </p>
              <div className="relative rounded-2xl overflow-hidden bg-black h-32 md:h-40 mb-6 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
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
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/30 w-full" />
              </div>
              
              <button
                onClick={captureOcr}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Capturar e Ler Texto
              </button>
              
              <button
                onClick={goHome}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* TELA OCR PROCESSING */}
          {currentScreen === SCREENS.OCR_PROCESSING && (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Processando Imagem...</h3>
              <p className="text-slate-400 text-sm text-center max-w-xs">
                Utilizando inteligência artificial para ler o texto da foto.
              </p>
            </div>
          )}

          {/* TELA SCANNING */}
          {currentScreen === SCREENS.SCANNING && (
            <div className="animate-fadeIn">
              <div className="relative">
                {/* Bordas decorativas */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg z-10" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg z-10" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg z-10" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg z-10" />
                
                {/* Container do scanner */}
                <div 
                  id={scannerElementId}
                  className="w-full aspect-square bg-black rounded-2xl overflow-hidden"
                />
                
                {/* Linha de scan animada */}
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scanLine" />
              </div>
              
              <p className="text-slate-400 text-center mt-4 text-sm animate-pulse">
                Posicione o código na área verde
              </p>
              
              <button
                onClick={goHome}
                className="w-full mt-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* TELA RESULTADO */}
          {currentScreen === SCREENS.RESULT && (
            <div className="animate-fadeIn">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-slate-300 text-center font-medium mb-4">
                Código Detectado!
              </h2>
              
              <div className="relative">
                <textarea
                  readOnly
                  value={scannedResult}
                  onClick={(e) => e.target.select()}
                  className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white font-mono text-sm resize-none focus:ring-2 focus:ring-emerald-500/50 cursor-text selection:bg-emerald-500/30"
                  rows={6}
                />
                
                {copyFeedback && (
                  <div className="absolute -top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
                    ✓ Copiado!
                  </div>
                )}
              </div>
              
              <button
                onClick={() => copyToClipboard(scannedResult)}
                className="w-full mt-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Novamente
              </button>
              
              <button
                onClick={startScanner}
                disabled={isLoading}
                className="w-full mt-3 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Nova Leitura
              </button>
              
              <button
                onClick={goHome}
                className="w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                ← Voltar ao início
              </button>
            </div>
          )}
        </div>
        
        {/* FOOTER */}
        <footer className="text-center mt-6 text-slate-600 text-xs">
          <p>Requer HTTPS para acesso à câmera</p>
        </footer>
      </div>
    </div>
  )
}
