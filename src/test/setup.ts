import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

HTMLDialogElement.prototype.showModal ??= function () {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close ??= function () {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}

window.requestAnimationFrame ??= (callback) =>
  window.setTimeout(() => callback(performance.now()), 0)
window.cancelAnimationFrame ??= window.clearTimeout

afterEach(cleanup)
