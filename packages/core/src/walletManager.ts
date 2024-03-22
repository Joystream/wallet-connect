import { Account, isInjectedWallet, SignerWallet, WalletManagerParams, WalletStatus } from './types'
import { WalletConnectConfiguration, WalletConnectProvider } from '@polkadot-onboard/wallet-connect'
import { WalletAggregator } from './walletAggregator'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { filterUnsupportedAccounts } from './utils/utils'
import { formatJoystreamAddress } from './utils/utils'
import { JoystreamLib } from '@polkadot-onboard/joystream'
import { MetadataDef } from '@polkadot/extension-inject/types'
import { DEFAULT_NODE_URL } from './utils/consts'

const INITIAL_WAIT_MS = 5

export class WalletManager {
  private timeoutId: NodeJS.Timeout | null = null
  currentWalletName: string
  currentWalletStatus: WalletStatus
  wallet: SignerWallet | null
  walletAccounts: Account[]
  lastUsedWallet: string | null
  availableWallets: SignerWallet[]
  wcConfig?: WalletConnectConfiguration
  appName: string
  joystreamLib: JoystreamLib

  constructor({ appName, wcConfig, chainNodeUrl }: WalletManagerParams) {
    this.currentWalletName = ''
    this.currentWalletStatus = WalletStatus.Unknown
    this.lastUsedWallet = localStorage.getItem('lastUsedWallet')
    this.availableWallets = []
    this.appName = appName
    this.wcConfig = wcConfig
    this.wallet = null
    this.walletAccounts = []
    this.joystreamLib = new JoystreamLib(chainNodeUrl || DEFAULT_NODE_URL, (connected: boolean) => {
      console.log('Node connection status:', connected)
    })
  }

  async initWallets(): Promise<SignerWallet[]> {
    return new Promise((resolve, reject) => {
      this.timeoutId = setTimeout(async () => {
        try {
          const injectedWalletProvider = new InjectedWalletProvider(this.appName)
          const walletConnectProvider = this.wcConfig ? new WalletConnectProvider(this.wcConfig, this.appName) : null
          console.log('wcpr', walletConnectProvider)
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

  async checkSignerStatus(): Promise<void> {
    const chainMetadata = await this.joystreamLib.getChainMetadata()

    // @ts-ignore edit wallet type
    if (!this.wallet) {
      return
    }

    if (isInjectedWallet(this.wallet) && this.wallet?.metadata && chainMetadata) {
      const extensionMetadata = await this.wallet.injected?.metadata?.get()
      const currentChain = extensionMetadata?.find(
        (infoEntry: { specVersion: number; genesisHash: string }) =>
          infoEntry.genesisHash === chainMetadata?.genesisHash
      )

      // if there isn't even a metadata entry for node with specific genesis hash then update
      if (!currentChain) {
        this.updateSignerMetadata()
        return
      }

      // if there is metadata for this node then verify specVersion
      const isOutdated = currentChain.specVersion < chainMetadata.specVersion
      if (isOutdated) {
        this.updateSignerMetadata()
      }
    }
  }

  async updateSignerMetadata(): Promise<boolean | undefined> {
    const chainMetadata = await this.joystreamLib.getChainMetadata()
    if (!this.wallet || !isInjectedWallet(this.wallet)) return
    return this.wallet?.injected?.metadata?.provide(chainMetadata as MetadataDef)
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

      // update metadata if needed
      await this.checkSignerStatus()

      localStorage.setItem('lastUsedWallet', walletName)
      return accountsWithWallet
    } catch (e) {
      this.currentWalletStatus = WalletStatus.Disconnected
      throw e
    }
  }
}
