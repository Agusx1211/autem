import { network } from 'hardhat'
import { ethers as hethers } from "hardhat"

import ora from 'ora'

import { Factory__factory } from '../typechain/factories/Factory__factory'

import { UniversalDeployer } from '@0xsequence/deployer'
import { BigNumber } from 'ethers'

const prompt = ora()

/**
 * @notice Deploy core wallet contracts via universal deployer
 *
 *   1. Deploy Wallet Factory via UD
 *   2. Deploy Main Module via UD
 *   3. Deploy Upgradable Main Module via UD
 *   4. Deploy Guest Module via UD
 */

const provider = hethers.provider

const signer = provider.getSigner()

const universalDeployer = new UniversalDeployer(network.name, provider)
const txParams = {
  gasLimit: 8000000,
  gasPrice: BigNumber.from(10)
    .pow(9)
    .mul(10)
}

const main = async () => {
  prompt.info(`Network Name:           ${network.name}`)
  prompt.info(`Local Deployer Address: ${await signer.getAddress()}`)
  prompt.info(`Local Deployer Balance: ${await signer.getBalance()}`)

  const walletFactory = await universalDeployer.deploy('Factory', Factory__factory, txParams)
  console.log("Wallet factory address", walletFactory.address)

  prompt.start(`writing deployment information to ${network.name}.json`)
  await universalDeployer.registerDeployment()
  prompt.succeed()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
