import { FormEvent, memo, useCallback, useEffect, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { BaseWallet, Account } from '@polkadot-onboard/core'
import { unitToPlanck } from '../utils/utils'
import { useWallets } from '@polkadot-onboard/react'

interface SendTransactionData {
  senderAddress: string
  receiverAddress: string
}

const Wallet = ({ wallet }: { wallet: BaseWallet }) => {
  // const [connected, setConnected] = useState(false)
  // const [accounts, setAccounts] = useState<Account[]>([])
  const [api, setApi] = useState<ApiPromise | null>(null)
  // const [isBusy, setIsBusy] = useState<boolean>(false)

  const { walletManager, currentWalletName } = useWallets()
  const isSelected = wallet.metadata.id === currentWalletName
  // const connected = walletManager?.currentWalletStatus === 'connected'
  const accountsWithWallet: Account[] = walletManager?.walletAccounts

  useEffect(() => {
    const setupApi = async () => {
      const provider = new WsProvider('wss://rpc.joystream.org:9944')
      const api = await ApiPromise.create({ provider })

      setApi(api)
    }

    setupApi()
  }, [])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      const form = event.target as HTMLFormElement
      event.preventDefault()
      event.stopPropagation()

      const data = new FormData(form)
      const { senderAddress, receiverAddress } = Object.fromEntries(data) as unknown as SendTransactionData

      if (api && wallet?.signer) {
        const amount = unitToPlanck('0.01', api.registry.chainDecimals[0])

        await api.tx.balances
          .transferKeepAlive(receiverAddress, amount)
          .signAndSend(senderAddress, { signer: wallet.signer }, () => {
            // do something with result
          })
      }
    },
    [api, wallet]
  )

  const handleConnect = useCallback(async () => {
     await walletManager?.initWallet(wallet.metadata.id)
  }, [walletManager, wallet])

  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={handleConnect}>{`${wallet.metadata.title} ${wallet.metadata.version || ''}`}</button>
      {isSelected && accountsWithWallet.length > 0 &&
        accountsWithWallet.map(({ address, name = '' }) => (
          <form key={address} onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
            <div>
              <label>Account name: {name}</label>
            </div>
            <div>
              <label>
                Account address: <input name="senderAddress" type="text" required readOnly value={address} size={60} />
              </label>
            </div>
            <div>
              <label>
                Receiver address: <input name="receiverAddress" type="text" required size={60} />
              </label>
            </div>
            <button type="submit">Send donation</button>
          </form>
        ))}
    </div>
  )
}

export default memo(Wallet)
