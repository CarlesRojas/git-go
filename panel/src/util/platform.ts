/**
 * macOS names the same modifiers differently and owns the ⌘/⌥/⌃ glyphs, so both the gestures
 * that read a modifier and the shortcuts that print one have to agree on which platform this is.
 */
export const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)
