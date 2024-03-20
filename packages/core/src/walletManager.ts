import { Account, BaseWallet, WalletStatus } from './types'
import { WalletConnectConfiguration, WalletConnectProvider } from '@polkadot-onboard/wallet-connect'
import { WalletAggregator } from './walletAggregator'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { filterUnsupportedAccounts } from './utils/utils'
import { formatJoystreamAddress } from './utils/utils'

const INITIAL_WAIT_MS = 5

export class WalletManager {
  private timeoutId: NodeJS.Timeout | null = null
  currentWalletName: string
  currentWalletStatus: WalletStatus
  wallet: BaseWallet | null
  walletAccounts: Account[]
  lastUsedWallet: string | null
  availableWallets: BaseWallet[]
  wcConfig?: WalletConnectConfiguration
  appName: string

  constructor(appName: string, wcConfig?: WalletConnectConfiguration) {
    this.currentWalletName = ''
    this.currentWalletStatus = WalletStatus.Unknown
    this.lastUsedWallet = localStorage.getItem('lastUsedWallet')
    this.availableWallets = []
    this.appName = appName
    this.wcConfig = wcConfig
    this.wallet = null
    this.walletAccounts = []
  }

  async initWallets(): Promise<BaseWallet[]> {
    return new Promise((resolve, reject) => {
      this.timeoutId = setTimeout(async () => {
        try {
          const injectedWalletProvider = new InjectedWalletProvider(this.appName)
          const walletConnectProvider = this.wcConfig ? new WalletConnectProvider(this.wcConfig, this.appName) : null
          const walletAggregator = new WalletAggregator([
            injectedWalletProvider,
            ...(walletConnectProvider ? [walletConnectProvider] : []),
          ])
          const wallets = await walletAggregator.getWallets()
          this.availableWallets = wallets
          resolve(wallets)
        } catch (error) {
          reject(error)
        }
      }, INITIAL_WAIT_MS)
    })
  }

  setCurrentWalletName(walletName: string): void {
    this.currentWalletName = walletName
  }

  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  async initWallet(walletName: string): Promise<Account[] | null> {
    try {
      this.currentWalletStatus = WalletStatus.Pending
      const allWallets = this.availableWallets
      const selectedWallet = allWallets.find((wallet) => wallet.metadata.id === walletName)

      if (!selectedWallet) {
        this.currentWalletStatus = WalletStatus.Disconnected
        return null
      }

      await selectedWallet.connect()

      // taken from https://github.com/TalismanSociety/talisman-connect/blob/47cfefee9f1333326c0605c159d6ee8ebfba3e84/libs/wallets/src/lib/base-dotsama-wallet/index.ts#L98-L107
      // should be part of future talisman-connect release
      const accounts = await selectedWallet.getAccounts()

      const accountsWithWallet = accounts
        .filter(filterUnsupportedAccounts)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((account: Account) => ({
          ...account,
          address: formatJoystreamAddress(account.address),
        }))

      this.wallet = selectedWallet
      this.currentWalletStatus = WalletStatus.Connected
      this.walletAccounts = accountsWithWallet
      this.setCurrentWalletName(selectedWallet.metadata.id)
      localStorage.setItem('lastUsedWallet', walletName)
      return accountsWithWallet
    } catch (e) {
      this.currentWalletStatus = WalletStatus.Disconnected
      throw e
    }
  }
}
