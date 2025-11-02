import { computed, onMounted, ref } from 'vue'

const DISMISS_STORAGE_KEY = 'monetraq-pwa-dismissed-until'
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

type InstallOutcome = 'accepted' | 'dismissed'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: InstallOutcome; platform: string }>
  prompt: () => Promise<void>
}

type InstallState = ReturnType<typeof createInstallState>

let sharedState: InstallState | null = null
let deferredPrompt: BeforeInstallPromptEvent | null = null
let listenersBound = false

function createInstallState() {
  const canInstall = ref(false)
  const isInstalling = ref(false)
  const wasInstalled = ref(false)
  const dismissedUntil = ref(0)

  const shouldShow = computed(() => {
    if (!canInstall.value || wasInstalled.value) {
      return false
    }

    const now = Date.now()
    return now >= dismissedUntil.value && !isInstalling.value
  })

  const setDismissedUntil = (timestamp: number) => {
    dismissedUntil.value = timestamp
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(timestamp))
    } catch (error) {
      // Ignore storage errors (private mode, etc.)
    }
  }

  const hydrateDismissal = () => {
    try {
      const stored = localStorage.getItem(DISMISS_STORAGE_KEY)
      if (stored) {
        const parsed = Number.parseInt(stored, 10)
        if (!Number.isNaN(parsed)) {
          dismissedUntil.value = parsed
        }
      }
    } catch (error) {
      // Ignore storage errors (private mode, etc.)
    }
  }

  const install = async () => {
    if (!deferredPrompt) {
      return
    }

    isInstalling.value = true
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        wasInstalled.value = true
      } else {
        setDismissedUntil(Date.now() + DISMISS_TTL_MS)
      }
    } finally {
      deferredPrompt = null
      canInstall.value = false
      isInstalling.value = false
    }
  }

  const dismiss = () => {
    setDismissedUntil(Date.now() + DISMISS_TTL_MS)
  }

  const markInstalled = () => {
    wasInstalled.value = true
    deferredPrompt = null
    canInstall.value = false
  }

  return {
    canInstall,
    isInstalling,
    shouldShow,
    install,
    dismiss,
    markInstalled,
    hydrateDismissal,
    setInstallAvailable: (availableEvent: BeforeInstallPromptEvent) => {
      deferredPrompt = availableEvent
      canInstall.value = true
    }
  }
}

function ensureListeners(state: InstallState) {
  if (listenersBound) {
    return
  }

  listenersBound = true

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    state.setInstallAvailable(event as BeforeInstallPromptEvent)
  })

  window.addEventListener('appinstalled', () => {
    state.markInstalled()
  })

  const displayModes = ['fullscreen', 'standalone', 'minimal-ui']
  if (window.matchMedia) {
    for (const displayMode of displayModes) {
      const query = `(display-mode: ${displayMode})`
      const media = window.matchMedia(query)
      if (media.matches) {
        state.markInstalled()
        break
      }
    }
  }
}

export function usePwaInstall() {
  if (!process.client) {
    const canInstall = ref(false)
    const isInstalling = ref(false)
    const shouldShow = computed(() => false)

    return {
      canInstall,
      isInstalling,
      shouldShow,
      install: async () => {},
      dismiss: () => {}
    }
  }

  if (!sharedState) {
    sharedState = createInstallState()
  }

  const state = sharedState

  onMounted(() => {
    state.hydrateDismissal()
    ensureListeners(state)
  })

  return {
    canInstall: state.canInstall,
    isInstalling: state.isInstalling,
    shouldShow: state.shouldShow,
    install: state.install,
    dismiss: state.dismiss
  }
}
