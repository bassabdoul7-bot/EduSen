import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../services/supabase';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

export default function SecurePDFViewer({ fileUrl, fileName, user, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getStoragePath = (url) => {
    if (!url.startsWith('http')) return url;
    const match = url.match(/\/concours\/(.+)$/);
    return match ? match[1] : url;
  };

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        const path = getStoragePath(fileUrl);
        const { data, error } = await supabase.storage
          .from('concours')
          .createSignedUrl(path, 60);
        if (error) throw error;
        setSignedUrl(data.signedUrl);
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          try {
            await supabase.from('pdf_access_logs').insert({
              user_id: currentUser.id,
              user_email: currentUser.email,
              file_path: path
            });
          } catch (e) {
            console.error('Log error:', e);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSignedUrl();
    const interval = setInterval(fetchSignedUrl, 50000);
    return () => clearInterval(interval);
  }, [fileUrl]);

  const [blurred, setBlurred] = useState(false);

  useEffect(() => {
    // Block right-click
    const block = (e) => e.preventDefault();

    // Block keyboard shortcuts
    const blockKeys = (e) => {
      // Block Ctrl+S, Ctrl+P, Ctrl+C, Ctrl+A, Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && ['s','p','S','P','c','C','a','A'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        // Clear clipboard
        navigator.clipboard?.writeText('').catch(() => {});
        setBlurred(true);
        setTimeout(() => setBlurred(false), 2000);
        return;
      }
      // Block F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
      // Block Ctrl+Shift+I (dev tools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return;
      }
      // Block Windows+Shift+S (Snipping tool)
      if (e.metaKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setBlurred(true);
        setTimeout(() => setBlurred(false), 3000);
      }
    };

    // Blur content when tab loses focus (user switching to screenshot tool)
    const handleVisibility = () => {
      if (document.hidden) {
        setBlurred(true);
      } else {
        // Delay unblur to catch screenshot tools
        setTimeout(() => setBlurred(false), 1500);
      }
    };

    // Blur on window blur (alt-tab, snipping tool overlay)
    const handleBlur = () => {
      setBlurred(true);
    };
    const handleFocus = () => {
      setTimeout(() => setBlurred(false), 1000);
    };

    // Try to enable FLAG_SECURE on Capacitor (native mobile)
    try {
      if (window.Capacitor?.isNativePlatform()) {
        // Android FLAG_SECURE
        window.Capacitor.Plugins?.ScreenProtection?.enable?.();
      }
    } catch (e) {}

    document.addEventListener('contextmenu', block);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      // Disable FLAG_SECURE when leaving
      try {
        if (window.Capacitor?.isNativePlatform()) {
          window.Capacitor.Plugins?.ScreenProtection?.disable?.();
        }
      } catch (e) {}
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement securise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-800 mb-4">{error}</p>
          <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg">Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Screenshot blur overlay */}
      {blurred && (
        <div className="absolute inset-0 z-[100] bg-black flex items-center justify-center" style={{ backdropFilter: 'blur(50px)' }}>
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <p className="text-white font-bold">Capture d'ecran non autorisee</p>
            <p className="text-white/40 text-sm mt-1">Ce document est protege</p>
          </div>
        </div>
      )}
      {/* Top bar - compact mobile */}
      <div className="bg-[#0a1f14] text-white px-3 py-2 flex items-center justify-between border-b border-white/10">
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-senegal-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-semibold truncate max-w-[150px]">{fileName}</span>
        </div>
        <span className="text-[10px] text-white/30 font-mono">{pageNumber}/{numPages || '?'}</span>
      </div>

      {/* PDF Content - pinch to zoom on mobile */}
      <div className="flex-1 overflow-auto bg-[#1a1a1a]" onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}
        style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="relative select-none min-h-full flex justify-center py-4 px-2">
          <Document
            file={signedUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<div className="flex items-center justify-center h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-senegal-green border-t-transparent"></div></div>}
            error={<div className="text-red-400 p-8 text-center text-sm">Erreur de chargement du document</div>}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(window.innerWidth - 16, 800)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Watermarks - repeating diagonal */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute text-white/[0.04] text-sm font-bold whitespace-nowrap select-none"
                style={{ transform: 'rotate(-35deg)', top: (15 + i * 16) + '%', left: '-10%', width: '150%' }}>
                {`KanGam · ${user?.email || ''} · ${new Date().toLocaleDateString('fr-FR')}      `.repeat(3)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls - mobile friendly */}
      <div className="bg-[#0a1f14] border-t border-white/10 px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Page nav */}
          <div className="flex items-center gap-1">
            <button onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}
              className="w-10 h-10 rounded-lg bg-white/[0.07] flex items-center justify-center disabled:opacity-30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs text-white/50 font-mono w-16 text-center">{pageNumber} / {numPages || '...'}</span>
            <button onClick={() => setPageNumber(p => Math.min(p + 1, numPages || p))} disabled={pageNumber >= numPages}
              className="w-10 h-10 rounded-lg bg-white/[0.07] flex items-center justify-center disabled:opacity-30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
              className="w-10 h-10 rounded-lg bg-white/[0.07] flex items-center justify-center text-white text-lg font-bold">−</button>
            <span className="text-[10px] text-white/30 w-10 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(s + 0.2, 3))}
              className="w-10 h-10 rounded-lg bg-white/[0.07] flex items-center justify-center text-white text-lg font-bold">+</button>
          </div>
        </div>
        <p className="text-[8px] text-white/15 text-center mt-1 select-none">Document protege KanGam · {user?.email}</p>
      </div>
    </div>
  );
}

