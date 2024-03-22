import { PolkadotWalletsContextProvider } from '@polkadot-onboard/react'
import { DEFAULT_NODE_URL, WalletManager } from '@polkadot-onboard/core'
import { WalletConnectConfiguration } from '@polkadot-onboard/wallet-connect'
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
    optionalChainIds: ['polkadot:6b5e488e0fa8f9821110d5c13f4c468a'],
    onSessionDelete: () => {
      // do something when session is removed
    },
  }

  const walletManager = new WalletManager({
    appName: 'test',
    wcConfig: walletConnectParams,
    chainNodeUrl: DEFAULT_NODE_URL,
  })

  const [showWallets, setShowWallets] = useState(false)

  return (
    <PolkadotWalletsContextProvider
      walletManager={walletManager}
      appName={APP_NAME}
      walletConnectParams={walletConnectParams}
    >
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
