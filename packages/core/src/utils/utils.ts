import { Account } from '@polkadot-onboard/core/src/types'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { JOYSTREAM_SS58_PREFIX } from './consts'
import { isHex, hexToU8a } from '@polkadot/util'

export const filterUnsupportedAccounts = (account: Account) => account.type === 'sr25519'

export const isValidAddressPolkadotAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address))
    return true
  } catch (error) {
    return false
  }
}

export const formatJoystreamAddress = (address: string) => {
  const publicKey = decodeAddress(address)
  return encodeAddress(publicKey, JOYSTREAM_SS58_PREFIX)
}
