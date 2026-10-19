// Anything can open the paywall with openPaywall('reason').
export function openPaywall(reason = 'default') {
  dispatchEvent(new CustomEvent('ug-paywall', { detail: reason }))
}
