import { getVSCodeApi } from '@/hook/useGitQueries'

const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

const pendingRequests = new Map<
  string,
  {
    resolve: (value: any) => void
    reject: (error: Error) => void
    timeout: NodeJS.Timeout
  }
>()

let messageListenerSetup = false

const setupGlobalMessageListener = () => {
  if (messageListenerSetup) return

  messageListenerSetup = true

  window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data

    if (message.requestId && pendingRequests.has(message.requestId)) {
      const pendingRequest = pendingRequests.get(message.requestId)!

      clearTimeout(pendingRequest.timeout)

      pendingRequests.delete(message.requestId)

      if (message.type === 'gitError') {
        pendingRequest.reject(new Error(message.error))
      } else {
        pendingRequest.resolve(message)
      }
      return
    }
  })
}

/**
 * Send a message to the extension with request/response correlation
 * @param messageType The type of message to send
 * @param payload Additional message payload
 * @param timeoutMs Timeout in milliseconds (default: 10 seconds)
 * @returns Promise that resolves with the response message
 */
export const sendCorrelatedMessage = <T = any>(
  messageType: string,
  payload: Record<string, any> = {},
  timeoutMs: number = 10_000,
): Promise<T> => {
  setupGlobalMessageListener()

  const requestId = generateRequestId()
  const vscode = getVSCodeApi()

  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error(`Timeout: Failed to ${messageType} after ${timeoutMs}ms`))
    }, timeoutMs)

    pendingRequests.set(requestId, { resolve, reject, timeout })

    vscode.postMessage({
      type: messageType,
      requestId,
      ...payload,
    })
  })
}

/**
 * Cleanup function to clear all pending requests (useful for component unmounting)
 */
export const clearPendingRequests = () => {
  for (const [requestId, pendingRequest] of pendingRequests) {
    clearTimeout(pendingRequest.timeout)
    pendingRequest.reject(new Error('Request cancelled'))
  }
  pendingRequests.clear()
}
