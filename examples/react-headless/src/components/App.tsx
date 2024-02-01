import { PolkadotWalletsContextProvider } from '@polkadot-onboard/react'
import { WalletAggregator } from '@polkadot-onboard/core'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { WalletConnectProvider, WalletConnectConfiguration } from '@polkadot-onboard/wallet-connect'
import { useState } from 'react'

import Wallets from './Wallets'

const APP_NAME = 'Joystream Demo app'

const App = () => {

  const walletConnectParams: WalletConnectConfiguration = {
    projectId: '33b2609463e399daee8c51726546c8dd',
    relayUrl: 'wss://relay.walletconnect.com',
    metadata: {
      name: 'Joystream demo app',
      description: 'Joystream Wallet-Connect',
      url: '#',
      icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
    chainIds: ['polkadot:6b5e488e0fa8f9821110d5c13f4c468a'],
    optionalChainIds: [],
    onSessionDelete: () => {
      // do something when session is removed
    },
  }

  const injectedWalletProvider = new InjectedWalletProvider(APP_NAME)

  const walletConnectProvider = new WalletConnectProvider(walletConnectParams, APP_NAME)
  const walletAggregator = new WalletAggregator([injectedWalletProvider, walletConnectProvider])
  const [showWallets, setShowWallets] = useState(false)

  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <button
        onClick={() => {
          setShowWallets(true)
        }}
      >
        get wallets
      </button>
      {showWallets && <Wallets />}
    </PolkadotWalletsContextProvider>
  )
}

export default App
