// load type augments
import { ApiPromise, WsProvider } from '@polkadot/api'
import { getSpecTypes } from '@polkadot/types-known'
import { base64Encode } from '@polkadot/util-crypto'

export class JoystreamLib {
  readonly api: ApiPromise

  //Todo: this file was taken from Atlas, should be removed when JoystreamLib package is available

  /* Lifecycle */
  constructor(endpoint: string, onNodeConnectionUpdate?: (connected: boolean) => unknown) {
    const provider = new WsProvider(endpoint)
    provider.on('connected', () => {
      this.logConnectionData(endpoint)
      onNodeConnectionUpdate?.(true)
    })
    provider.on('disconnected', () => {
      onNodeConnectionUpdate?.(false)
    })
    provider.on('error', () => {
      onNodeConnectionUpdate?.(false)
    })

    this.api = new ApiPromise({ provider })
  }

  destroy() {
    this.api.disconnect()
    console.log('[JoystreamLib] Destroyed')
  }

  private async ensureApi() {
    try {
      await this.api.isReady
    } catch (e) {
      throw new Error('API is not ready')
    }
  }

  private async logConnectionData(endpoint: string) {
    await this.ensureApi()
    const chain = await this.api.rpc.system.chain()
    console.log(`[JoystreamLib] Connected to chain "${chain}" via "${endpoint}"`)
  }

  /* Public */

  async getChainMetadata() {
    await this.ensureApi()
    const systemChain = await this.api.rpc.system.chain()

    return {
      icon: 'substrate',
      chainType: 'substrate',
      chain: systemChain.toString(),
      metaCalls: base64Encode(this.api.runtimeMetadata.asCallsOnly.toU8a()),
      types: getSpecTypes(
        this.api.registry,
        systemChain.toString(),
        this.api.runtimeVersion.specName.toString(),
        this.api.runtimeVersion.specVersion
      ),
      specVersion: this.api.runtimeVersion.specVersion.toNumber(),
      ss58Format: this.api.registry.chainSS58 ?? 0,
      tokenDecimals: this.api.registry.chainDecimals[0],
      tokenSymbol: this.api.registry.chainTokens[0],
      genesisHash: this.api.genesisHash.toHex(),
    }
  }
}
