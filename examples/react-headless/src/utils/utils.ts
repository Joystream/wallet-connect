import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { JOYSTREAM_SS58_PREFIX } from '@polkadot-onboard/core'
export const formatJoystreamAddress = (address: string) => {
  const publicKey = decodeAddress(address)
  return encodeAddress(publicKey, JOYSTREAM_SS58_PREFIX)
}

export const unitToPlanck = (units: string, decimals: number) => {
  let [whole, decimal] = units.split('.')

  if (typeof decimal === 'undefined') {
    decimal = ''
  }

  return `${whole}${decimal.padEnd(decimals, '0')}`.replace(/^0+/, '')
}
