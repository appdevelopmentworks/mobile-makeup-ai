'use client'

import { useEffect } from 'react'
import { PWAInstallPrompt } from './pwa-install-prompt'

export function PWAManager() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    }

    // Setup background sync for offline functionality
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      setupBackgroundSync()
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered successfully:', registration.scope)

      // Update available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Show update available notification
              showUpdateNotification(registration)
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload)
        }
      })

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const setupBackgroundSync = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Register sync events for offline functionality
      if ('sync' in registration) {
        await (registration as any).sync.register('face-analysis-sync')
        await (registration as any).sync.register('usage-sync')
        console.log('Background sync registered')
      }
    } catch (error) {
      console.error('Background sync setup failed:', error)
    }
  }

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        console.log('Notification permission granted')
        
        // Subscribe to push notifications (optional)
        await subscribeToNotifications()
      }
    } catch (error) {
      console.error('Notification permission request failed:', error)
    }
  }

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      if ('pushManager' in registration) {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Add your VAPID public key here
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })

        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        })

        console.log('Push notification subscription successful')
      }
    } catch (error) {
      console.error('Push notification subscription failed:', error)
    }
  }

  const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
    // You can customize this to show a toast or modal
    if (confirm('新しいバージョンが利用可能です。今すぐ更新しますか？')) {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      }
    }
  }

  return <PWAInstallPrompt />
}

// Utility function to check if app is running as PWA
export function isPWA(): boolean {
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as any).standalone === true
}

// Utility function to check if device supports installation
export function canInstall(): boolean {
  return 'beforeinstallprompt' in window ||
         (/iPad|iPhone|iPod/.test(navigator.userAgent) && 'standalone' in navigator)
}