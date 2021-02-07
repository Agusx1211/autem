
import React, { useContext, useEffect, useState } from "react"

import { useCallback } from "react"
import { ethers } from "ethers"
import { LocalStore } from "../utils/local-store"
import { useWeb3Context } from "./Web3"
import { Autem__factory } from "../contracts"
import { set } from "../utils"

export type TrustInitialParameters = {
  owner: string,
  beneficiary: string,
  window: ethers.BigNumber,
  metadata: string
}

export type TrustsState = {
  knownTrusts: string[],
  knownInitialParameters: TrustInitialParameters[],
  hiddenTrusts: string[]
}

export type TrustContext = TrustsState & {
  addTrust?: (trust: string) => void,
  removeTrust?: (trust: string) => boolean,
  hideTrust?: (trust: string) => void,
  removeHideTrust?: (trust: string) => boolean,
  hasTrust?: (trust: string) => boolean,
  addKnownInitialParameters?: (parameters: TrustInitialParameters) => void
}

const TrustsContext = React.createContext<TrustContext>({ knownTrusts: [], knownInitialParameters: [], hiddenTrusts: [] })

export function useTrustsContext() {
  return useContext(TrustsContext)
}

const getStores = (id: number) => {
  return {
    storageTrusts: new LocalStore<string[]>(`known-trusts-${id}`, []),
    storageInitialParameters: new LocalStore<TrustInitialParameters[]>(`known-initial-parameters-${id}`, []),
    hiddenTrusts: new LocalStore<string[]>(`hidden-trusts-${id}`, [])
  }
}

export default function TrustsProvider({ children }: { children: any }) {
  const { readProvider, accounts, chainId } = useWeb3Context()

  const { storageTrusts, storageInitialParameters, hiddenTrusts } = getStores(chainId)

  const buildState = useCallback(() => {
    return {
      knownInitialParameters: storageInitialParameters.get(),
      knownTrusts: storageTrusts.get(),
      hiddenTrusts: hiddenTrusts.get()
    }
  }, [storageTrusts, storageInitialParameters, hiddenTrusts])

  const [state, setState] = useState<TrustsState>(buildState())

  useEffect(() => {
    setState(buildState())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  const addTrust = useCallback((trust: string) => {
    const newState = buildState()
    const newTrusts = set(newState.knownTrusts.concat(trust))
    setState({ ...newState, knownTrusts: newTrusts })
    storageTrusts.set(newTrusts)
  }, [buildState, storageTrusts])

  const hasTrust = useCallback((trust: string) => {
    const newState = buildState()
    return newState.knownTrusts.includes(trust)
  }, [buildState])

  const addKnownInitialParameters = useCallback((parameters: TrustInitialParameters) => {
    const newState = buildState()
    const newInitialParameters = set(newState.knownInitialParameters.concat(parameters))
    setState({ ...newState, knownInitialParameters: newInitialParameters })
    storageInitialParameters.set(newInitialParameters)
  }, [buildState, storageInitialParameters])

  const removeTrust = useCallback((trust: string) => {
    const newState = buildState()
    const newTrusts = newState.knownTrusts.filter((k) => k !== trust)
    if (newTrusts.length === newState.knownTrusts.length) return false
    setState({ ...newState, knownTrusts: newTrusts })
    storageTrusts.set(newTrusts)
    return true
  }, [buildState, storageTrusts])

  const hideTrust = useCallback((trust: string) => {
    const newState = buildState()
    const newHiddenTrusts = set(newState.hiddenTrusts.concat(trust))
    setState({ ...newState, hiddenTrusts: newHiddenTrusts })
    hiddenTrusts.set(newHiddenTrusts)
  }, [buildState, hiddenTrusts])

  const removeHideTrust = useCallback((trust: string) => {
    const newState = buildState()
    const newHiddenTrusts = newState.hiddenTrusts.filter((k) => k !== trust)
    if (newHiddenTrusts.length === newState.hiddenTrusts.length) return false
    setState({ ...newState, hiddenTrusts: newHiddenTrusts })
    hiddenTrusts.set(newHiddenTrusts)
    return true
  }, [buildState, hiddenTrusts])

  const context = {
    ...state,
    addTrust,
    hasTrust,
    addKnownInitialParameters,
    removeTrust,
    hideTrust,
    removeHideTrust
  }

  useEffect(() => {
    if (!accounts || accounts.length === 0) return

    readProvider.getLogs({
      topics: [
        '0x167d3e9c1016ab80e58802ca9da10ce5c6a0f4debc46a2e7a2cd9e56899a4fb5',
        ethers.utils.defaultAbiCoder.encode(['address'], [accounts[0]])
      ],
      fromBlock: 0,
      toBlock: 'latest'
    }).then(async (logs) => {
      console.info(`Found ${logs.length} possible trusts`)
      const addresses = logs.map((l) => l.address)
      const areTrusts = await Promise.all(addresses.map(async (addr) => {
        const autem = Autem__factory.connect(addr, readProvider)
        try {
          return await autem.owner() === accounts[0]
        } catch (e) {
          console.warn(e)
          return false
        }
      }))

      const foundTrusts = addresses.filter((_, i) => areTrusts[i])
      console.info(`Filtered down to ${foundTrusts.length} trusts`)

      const newState = buildState()
      const newTrusts = set(newState.knownTrusts.concat(foundTrusts))
      setState({ ...newState, knownTrusts: newTrusts })
      storageTrusts.set(newTrusts)
    }).catch((e) => { console.warn(e)})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readProvider, accounts, chainId])

  return (
    <TrustsContext.Provider value={context}>
      {children}
    </TrustsContext.Provider>
  )
}
