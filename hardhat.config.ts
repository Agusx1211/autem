import { task } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "solidity-coverage"
import "hardhat-watcher"
import "hardhat-gas-reporter"
import "hardhat-typechain"

import { networkConfig } from "./scripts/configLoader"

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: {
    version: '0.8.1',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false
  },
  networks: {
    rinkeby: networkConfig('rinkeby'),
    kovan: networkConfig('kovan'),
    goerli: networkConfig('goerli'),
    matic: networkConfig('matic'),
    mumbai: networkConfig('mumbai'),
    coverage: {
      url: 'http://localhost:8555'
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: networkConfig('mainnet').etherscan
  }
}
