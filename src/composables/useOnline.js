import { onMounted, onUnmounted, ref } from 'vue'

const isOnline = ref(navigator.onLine)

export function useOnline() {
  const updateStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateStatus)
    window.removeEventListener('offline', updateStatus)
  })

  return {
    isOnline
  }
}