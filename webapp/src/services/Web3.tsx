import React, { useContext, useState } from "react"

import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider"
import BurnerConnectProvider from "@burner-wallet/burner-connect-provider"
import { useCallback } from "react"
import { ethers } from "ethers"
import { providers } from '@0xsequence/multicall'

export const RPC_MAINNET = "https://cloudflare-eth.com/"
export const FACTORY_ADDRESS = "0xB7e495092749dE8D30CA30B91e437E15e399Ef69"
export const IMPLEMENTATION_ADDRESS = "0x8114F33b87128DD938F4B69966b7B11C0DEB069F"
export const DEFAULT_NETWORK = 1

export function newModal() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: RPC_MAINNET
        }
      }
    },
    burnerconnect: {
      package: BurnerConnectProvider,
      options: {
        defaultNetwork: "1"
      }
    }
  }

  return new Web3Modal({
    cacheProvider: false,
    providerOptions: providerOptions
  })
}

export function chainInfo(id: ethers.BigNumberish): { name: string, supported: boolean } {
  switch (ethers.BigNumber.from(id).toNumber()) {
    case 1: return { name: "Ethereum Mainnet", supported: true }
    case 2: return { name: "Expanse Network", supported: false }
    case 3: return { name: "Ethereum Ropsten", supported: false }
    case 4: return { name: "Ethereum Rinkeby", supported: false }
    case 5: return { name: "Ethereum Görli", supported: true }
    case 6: return { name: "Ethereum Classic Testnet Kotti", supported: false }
    case 7: return { name: "ThaiChain", supported: false }
    case 8: return { name: "Ubiq Network Mainnet", supported: false }
    case 9: return { name: "Ubiq Network Testnet", supported: false }
    case 10: return { name: "Optimistic Ethereum", supported: false }
    case 11: return { name: "Metadium Mainnet", supported: false }
    case 12: return { name: "Metadium Testnet", supported: false }
    case 13: return { name: "Diode Testnet Staging", supported: false }
    case 14: return { name: "Flare Mainnet", supported: false }
    case 15: return { name: "Diode Prenet", supported: false }
    case 16: return { name: "Flare Testnet Coston", supported: false }
    case 18: return { name: "ThunderCore Testnet", supported: false }
    case 20: return { name: "ELA-ETH-Sidechain Mainnet", supported: false }
    case 21: return { name: "ELA-ETH-Sidechain Testnet", supported: false }
    case 30: return { name: "RSK Mainnet", supported: false }
    case 31: return { name: "RSK Testnet", supported: false }
    case 38: return { name: "Valorbit", supported: false }
    case 42: return { name: "Ethereum Testnet Kovan", supported: false }
    case 50: return { name: "XinFin Network Mainnet", supported: false }
    case 51: return { name: "XinFin Apothem Testnet", supported: false }
    case 56: return { name: "Binance Smart Chain Mainnet", supported: false }
    case 60: return { name: "GoChain", supported: false }
    case 61: return { name: "Ethereum Classic Mainnet", supported: false }
    case 62: return { name: "Ethereum Classic Testnet Morden", supported: false }
    case 63: return { name: "Ethereum Classic Testnet Mordor", supported: false }
    case 64: return { name: "Ellaism", supported: false }
    case 65: return { name: "OKExChain Testnet", supported: false }
    case 66: return { name: "OKExChain Mainnet", supported: false }
    case 67: return { name: "DBChain Testnet", supported: false }
    case 68: return { name: "SoterOne Mainnet", supported: false }
    case 76: return { name: "Mix", supported: false }
    case 77: return { name: "POA Network Sokol", supported: false }
    case 82: return { name: "Meter Mainnet", supported: false }
    case 88: return { name: "TomoChain", supported: false }
    case 97: return { name: "Binance Smart Chain Testnet", supported: false }
    case 99: return { name: "POA Network Core", supported: false }
    case 100: return { name: "xDAI Chain", supported: false }
    case 101: return { name: "EtherInc", supported: false }
    case 108: return { name: "ThunderCore Mainnet", supported: false }
    case 122: return { name: "Fuse Mainnet", supported: false }
    case 128: return { name: "Huobi ECO Chain Mainnet", supported: false }
    case 137: return { name: "Matic Mainnet", supported: true }
    case 162: return { name: "Lightstreams Testnet", supported: false }
    case 163: return { name: "Lightstreams Mainnet", supported: false }
    case 211: return { name: "Freight Trust Network", supported: false }
    case 246: return { name: "Energy Web Chain", supported: false }
    case 250: return { name: "Fantom Opera", supported: false }
    case 256: return { name: "Huobi ECO Chain Testnet", supported: false }
    case 269: return { name: "High Performance Blockchain", supported: false }
    case 385: return { name: "Lisinski", supported: false }
    case 420: return { name: "Optimistic Ethereum Testnet Goerli", supported: false }
    case 499: return { name: "Rupaya", supported: false }
    case 558: return { name: "Tao Network", supported: false }
    case 595: return { name: "Acala Mandala Testnet", supported: false }
    case 686: return { name: "Karura Network", supported: false }
    case 787: return { name: "Acala Network", supported: false }
    case 820: return { name: "Callisto Mainnet", supported: false }
    case 821: return { name: "Callisto Testnet", supported: false }
    case 977: return { name: "Nepal Blockchain Network", supported: false }
    case 1001: return { name: "Klaytn Testnet Baobab", supported: false }
    case 1007: return { name: "Newton Testnet", supported: false }
    case 1012: return { name: "Newton", supported: false }
    case 1139: return { name: "MathChain", supported: false }
    case 1140: return { name: "MathChain Testnet", supported: false }
    case 1620: return { name: "Atheios", supported: false }
    case 1856: return { name: "Teslafunds", supported: false }
    case 1987: return { name: "EtherGem", supported: false }
    case 2020: return { name: "420coin", supported: false }
    case 5869: return { name: "Wegochain Rubidium Mainnet", supported: false }
    case 8217: return { name: "Klaytn Mainnet Cypress", supported: false }
    case 8995: return { name: "bloxberg", supported: false }
    case 24484: return { name: "Webchain", supported: false }
    case 31102: return { name: "Ethersocial Network", supported: false }
    case 39797: return { name: "Energi Mainnet", supported: false }
    case 42069: return { name: "pegglecoin", supported: false }
    case 43110: return { name: "Athereum", supported: false }
    case 49797: return { name: "Energi Testnet", supported: false }
    case 73799: return { name: "Energy Web Volta Testnet", supported: false }
    case 78110: return { name: "Firenze test network", supported: false }
    case 80001: return { name: "Matic Testnet Mumbai", supported: false }
    case 200625: return { name: "Akroma", supported: false }
    case 246529: return { name: "ARTIS sigma1", supported: false }
    case 246785: return { name: "ARTIS Testnet tau1", supported: false }
    case 1313114: return { name: "Ether-1", supported: false }
    case 1313500: return { name: "Xerom", supported: false }
    case 7762959: return { name: "Musicoin", supported: false }
    case 13371337: return { name: "PepChain Churchill", supported: false }
    case 18289463: return { name: "IOLite", supported: false }
    case 28945486: return { name: "Auxilium Network Mainnet", supported: false }
    case 35855456: return { name: "Joys Digital Mainnet", supported: false }
    case 61717561: return { name: "Aquachain", supported: false }
    case 99415706: return { name: "Joys Digital TestNet", supported: false }
    case 1122334455: return { name: "IPOS Network", supported: false }
    case 1313161554: return { name: "NEAR MainNet", supported: false }
    case 1313161555: return { name: "NEAR TestNet", supported: false }
    case 1313161556: return { name: "NEAR BetaNet", supported: false }
    case 1666600000: return { name: "Harmony Mainnet Shard 0", supported: false }
    case 1666600001: return { name: "Harmony Mainnet Shard 1", supported: false }
    case 1666600002: return { name: "Harmony Mainnet Shard 2", supported: false }
    case 1666600003: return { name: "Harmony Mainnet Shard 3", supported: false }
    case 3125659152: return { name: "Pirl", supported: false }
  }

  return { name: "Unknown", supported: false }
}

export type Web3ContextState = {
  modal: Web3Modal,
  chainId: number,
  provider?: ethers.providers.Web3Provider,
  connected?: boolean,
  accounts?: string[]
}

export type Web3ContextType = Web3ContextState & {
  offlineProvider: ethers.providers.Provider,
  readProvider: ethers.providers.Provider,
  disconnect?: () => void
  connect?: (callback?: () => void) => void
}

const MulticallOptions = {
  contract: "0x88b1F30E7b6BefA20880DD8059Fe5C3002A7fD48"
}

const offlineProvider = new providers.MulticallProvider(new ethers.providers.JsonRpcProvider(RPC_MAINNET), MulticallOptions)
const Web3Context = React.createContext<Web3ContextType>({ modal: newModal(), offlineProvider, readProvider: offlineProvider, chainId: DEFAULT_NETWORK })

export function useWeb3Context() {
  return useContext(Web3Context)
}

export default function Web3Provider({ children }: { children: any }) {
  const [state, setState] = useState<Web3ContextState>({ modal: newModal(), chainId: DEFAULT_NETWORK })

  const disconnect = useCallback(() => {
    // This is a hack, I don't know of any other way of restarting walletconnect with modal
    window.localStorage.removeItem('walletconnect')

    state.modal.clearCachedProvider()
    setState({ ...state, connected: false, provider: undefined })
  }, [state])

  const connect = async (callback?: () => void) => {
    const modal = newModal()
    const og = await modal.connect()
    const result = new providers.MulticallExternalProvider(og)
    const provider = new ethers.providers.Web3Provider(result)
    setState({ modal: modal, provider: provider, connected: true, accounts: await provider.listAccounts(), chainId: (await provider.getNetwork()).chainId })
    if (callback) callback()
  }

  const readProvider = state.provider ? state.provider : offlineProvider
  const chainId = state.provider ? state.chainId : DEFAULT_NETWORK

  return (
    <Web3Context.Provider value={{...state, offlineProvider, readProvider, chainId, disconnect: disconnect, connect: connect }}>
      {children}
    </Web3Context.Provider>
  )
}
