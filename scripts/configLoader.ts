import * as dotenv from 'dotenv'
import * as path from 'path'
import { HttpNetworkConfig } from 'hardhat/types'

type EthereumNetworksTypes = 'rinkeby' | 'ropsten' | 'kovan' | 'goerli' | 'mainnet' | 'mumbai' | 'matic'

export const getEnvConfig = (env: string) => {
  const envFile = path.resolve(__dirname, `../config/${env}.env`)
  const envLoad = dotenv.config({ path: envFile })

  if (envLoad.error) {
    throw Error('Configuration not found')
  }

  return envLoad.parsed || {}
}

export const networkConfig = (network: EthereumNetworksTypes): HttpNetworkConfig & { etherscan: string } => {
  const config = getEnvConfig('PROD')

  const account = (() => {
    if (config['ETH_MNEMONIC']) {
      return {
        mnemonic: config['ETH_MNEMONIC'],
        initialIndex: 0,
        count: 10,
        path: `m/44'/60'/0'/0`
      }
    }

    return [config['PRIVATE_KEY']]
  })()

  const networkConfig: HttpNetworkConfig & { etherscan: string } = {
    url: ((network) => {
      switch (network) {
        case 'mumbai':
          return 'https://rpc-mumbai.matic.today/'

        case 'matic':
          return 'https://rpc-mainnet.matic.network'

        default:
          if (config['INFURA_API_KEY']) {
            return `https://${network}.infura.io/v3/${config['INFURA_API_KEY']}`
          } else {
            return config[`RPC_URL_${network.toUpperCase()}`]
          }
      }
    })(network),
    accounts: account,
    gas: 'auto',
    gasPrice: 'auto',
    gasMultiplier: 1,
    timeout: 20000,
    httpHeaders: {},
    etherscan: config['ETHERSCAN_KEY']
  }

  return networkConfig
}
