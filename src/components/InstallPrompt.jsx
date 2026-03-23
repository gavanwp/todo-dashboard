import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if dismissed recently (don't show again for 7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS install guide after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="install-prompt-backdrop"
        onClick={handleDismiss}
      />

      {/* Prompt Card */}
      <div className="install-prompt-card">
        <button
          className="install-prompt-close"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="install-prompt-icon">
          <Smartphone size={32} />
        </div>

        <h3 className="install-prompt-title">Install TaskFlow</h3>
        <p className="install-prompt-desc">
          Add TaskFlow to your home screen for quick access — works like a native app!
        </p>

        {isIOS ? (
          <>
            {!showIOSGuide ? (
              <button
                className="install-prompt-btn"
                onClick={() => setShowIOSGuide(true)}
              >
                <Download size={18} />
                Show Me How
              </button>
            ) : (
              <div className="install-prompt-ios-steps">
                <div className="install-step">
                  <span className="install-step-num">1</span>
                  <span>Tap the <strong>Share</strong> button <span style={{ fontSize: '1.2em' }}>⎋</span> in Safari</span>
                </div>
                <div className="install-step">
                  <span className="install-step-num">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </div>
                <div className="install-step">
                  <span className="install-step-num">3</span>
                  <span>Tap <strong>"Add"</strong> to confirm</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            className="install-prompt-btn"
            onClick={handleInstall}
          >
            <Download size={18} />
            Install App
          </button>
        )}

        <button
          className="install-prompt-dismiss"
          onClick={handleDismiss}
        >
          Not now
        </button>
      </div>
    </>
  );
}
