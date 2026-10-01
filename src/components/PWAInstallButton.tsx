import React, { useState } from 'react';
import { Download, Smartphone, Laptop, Apple, Check, X, Sparkles, HelpCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  isCompactOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isCompactOnMobile = false }) => {
  const { isInstallable, isInstalled, isIOS, install, markAsInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'pc'>(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) return 'ios';
      if (/android/.test(ua)) return 'android';
    }
    return 'android';
  });

  // If already marked as installed or running in standalone PWA mode, do not render the install button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setShowModal(false);
        return;
      }
    }
    // Show instruction modal if automatic prompt wasn't triggered or user wants guidance
    setShowModal(true);
  };

  const handleConfirmInstalled = () => {
    markAsInstalled();
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 ${
          isCompactOnMobile ? 'px-2.5 py-1.5' : 'px-3 py-1.5'
        } text-xs font-bold rounded-full bg-[#c8824b] text-black hover:bg-[#b5733f] transition-transform active:scale-95 shadow-md shadow-[#c8824b]/25 shrink-0`}
        title="Instalar CAPIBARA SOUND en tu teléfono o PC"
      >
        <Download className="w-3.5 h-3.5" />
        <span className={isCompactOnMobile ? 'inline' : 'inline'}>Instalar</span>
      </button>

      {/* Complete Installation Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#181818] border border-neutral-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c8824b]/20 border border-[#c8824b]/40 flex items-center justify-center text-[#c8824b] shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>Instalar Capibara Sound</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c8824b]/20 text-[#c8824b] border border-[#c8824b]/30">PWA Nativa</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Audio continuo con pantalla apagada y en segundo plano</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Netlify Production URL Banner */}
            <div className="mx-5 mt-5 p-3 rounded-xl bg-neutral-900 border border-[#c8824b]/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#c8824b]/10">
              <div className="text-left w-full sm:w-auto">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c8824b] animate-pulse" />
                  <span>Enlace de Instalación Oficial</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Accede desde la URL de producción para instalarlo en un clic:
                </div>
                <div className="text-xs font-mono font-bold text-[#c8824b] mt-1 select-all break-all">
                  https://capibarasound.netlify.app
                </div>
              </div>
              <a
                href="https://capibarasound.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-[#c8824b] hover:bg-[#b5733f] text-black rounded-lg transition-transform active:scale-95 text-center flex items-center justify-center gap-1.5"
              >
                <span>Ir al Sitio Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Device Platform Tabs */}
            <div className="flex border-b border-neutral-800 bg-[#141414] px-4 pt-3 gap-2">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors ${
                  activeDeviceTab === 'android'
                    ? 'border-[#c8824b] text-[#c8824b] bg-neutral-800/60'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android / Chrome</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors ${
                  activeDeviceTab === 'ios'
                    ? 'border-[#c8824b] text-[#c8824b] bg-neutral-800/60'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>iPhone / Safari</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab('pc')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-colors ${
                  activeDeviceTab === 'pc'
                    ? 'border-[#c8824b] text-[#c8824b] bg-neutral-800/60'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* Tab Instructions Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {activeDeviceTab === 'android' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <p className="font-semibold text-white mb-1">En Google Chrome / Edge para Android:</p>
                    <ol className="space-y-2 mt-2">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                        <span>Toca el botón de <strong>3 puntos verticales (⋮)</strong> en la esquina superior derecha del navegador.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                        <span>Selecciona la opción <strong>«Instalar aplicación»</strong> o <strong>«Añadir a pantalla principal»</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                        <span>Confirma con <strong>Instalar</strong>. ¡Se abrirá como una aplicación nativa completa con icono de Capibara!</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {activeDeviceTab === 'ios' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <p className="font-semibold text-white mb-1">En Safari para iPhone / iPad:</p>
                    <ol className="space-y-2 mt-2">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                        <span>Toca el botón <strong>Compartir</strong> (el cuadrado con flecha apuntando hacia arriba en la barra inferior).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                        <span>Desplázate hacia abajo y pulsa <strong>«Añadir a la pantalla de inicio»</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                        <span>Pulsa <strong>Añadir</strong> en la esquina superior. Tendrás acceso directo con controles de bloqueo de pantalla.</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {activeDeviceTab === 'pc' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <p className="font-semibold text-white mb-1">En Chrome, Edge o Brave de Escritorio:</p>
                    <ol className="space-y-2 mt-2">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                        <span>En la barra de direcciones arriba a la derecha, haz clic en el icono de <strong>Instalar Capibara Sound (icono de pantalla con flecha)</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#c8824b]/20 text-[#c8824b] font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                        <span>O ve al menú de tres puntos (⋮) → <strong>Guardar y compartir</strong> → <strong>Instalar página como aplicación</strong>.</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Benefits badge */}
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/25 flex items-start gap-2.5 text-orange-300">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#c8824b]" />
                <div className="leading-snug">
                  <strong>Ventajas al instalar:</strong> Funciona sin pestañas de navegador abiertas, reproduce con la pantalla bloqueada en el bolsillo, ahorra 90% de batería y no consume datos en modo offline.
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-neutral-800 bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-3">
              {isInstallable ? (
                <button
                  onClick={async () => {
                    await install();
                    setShowModal(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#c8824b] hover:bg-[#b5733f] text-black text-xs font-bold transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Lanzar Instalación Directa</span>
                </button>
              ) : (
                <span className="text-[11px] text-neutral-400">
                  Sigue los pasos según tu dispositivo arriba
                </span>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleConfirmInstalled}
                  className="px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
                  title="Marcar como instalada para ocultar este botón permanentemente"
                >
                  <Check className="w-3.5 h-3.5 inline mr-1 text-[#c8824b]" />
                  Ya la instalé (Ocultar botón)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
