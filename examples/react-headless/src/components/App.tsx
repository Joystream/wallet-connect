import { PolkadotWalletsContextProvider } from '@polkadot-onboard/react'
import { WalletAggregator } from '@polkadot-onboard/core'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { WalletConnectProvider, walletConnectParams } from '@polkadot-onboard/wallet-connect'
import { useState } from 'react'

import Wallets from './Wallets'
import { WalletConnectConfiguration } from '@polkadot-onboard/wallet-connect/dist';

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
    chainIds: ['polkadot:e143f23803ac50e8f6f8e62695d1ce9e', 'polkadot:91b171bb158e2d3848fa23a9f1c25182'],
    optionalChainIds: ['polkadot:67f9723393ef76214df0118c34bbbd3d', 'polkadot:7c34d42fc815d392057c78b49f2755c7'],
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
