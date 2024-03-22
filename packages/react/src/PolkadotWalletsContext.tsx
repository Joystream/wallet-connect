import type { BaseWallet } from '@polkadot-onboard/core'

import { createContext, useState, useMemo, useEffect, useContext } from 'react'
import { WalletManager } from '@polkadot-onboard/core'

interface PolkadotWalletsContextProviderProps {
  children: any
  walletManager: WalletManager
  appName: string
  wcConfig?: any
  initialWaitMs?: number
}

interface PolkadotWalletsContextProps {
  wallets: BaseWallet[] | undefined
  walletManager?: WalletManager
  currentWalletName: string | undefined
}

const PolkadotWalletsContext = createContext<PolkadotWalletsContextProps>({
  wallets: undefined,
  walletManager: undefined,
  currentWalletName: undefined,
})

export const useWallets = () => {
  const context = useContext(PolkadotWalletsContext)
  if (!context) {
    throw new Error('PolkadotWalletsContext must be used within a PolkadotWalletsContextProvider')
  }
  return context
}

export const PolkadotWalletsContextProvider = ({
  children,
  walletManager,
  appName,
  wcConfig,
  initialWaitMs = 5 /* the default is set to 5ms to give extensions enough lead time to inject their providers */,
}: PolkadotWalletsContextProviderProps) => {
  const [wallets, setWallets] = useState<BaseWallet[] | undefined>()
  const [curWName, setCurrentWalletName] = useState<string | undefined>(walletManager.currentWalletName)

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const wallets = await walletManager.initWallets()
      setWallets(wallets)
    }, initialWaitMs)

    const setWalletName = (walletName: string) => {
      setCurrentWalletName(walletName)
    }

    walletManager.setCurrentWalletName = setWalletName

    return () => {
      walletManager.setCurrentWalletName = () => {}
      clearTimeout(timeoutId)
    }
  }, [walletManager])

  const contextData = useMemo(() => {
    return {
      wallets,
      walletManager,
      currentWalletName: curWName,
    }
  }, [wallets, curWName, walletManager])

  return <PolkadotWalletsContext.Provider value={contextData}>{children}</PolkadotWalletsContext.Provider>
}
