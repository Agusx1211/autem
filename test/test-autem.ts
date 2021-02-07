import { ethers as hethers } from "hardhat"
import { ethers } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"
import chai from "chai"
import chaiAsPromised from 'chai-as-promised'

export const { assert, expect } = chai
  .use(chaiAsPromised)

const advanceTime = async (time: ethers.BigNumberish) => {
  await hethers.provider.send('evm_increaseTime', [
    ethers.BigNumber.from(time).toNumber()
  ])
}

const RevertError = (errorMessage?: string) => {
  let prefix = 'VM Exception while processing transaction: revert'
  return errorMessage ? `${prefix + ' ' + errorMessage}` : prefix
}

describe("Autem", () => {
  let factory: ethers.Contract

  let owner: SignerWithAddress
  let beneficiary: SignerWithAddress
  let impostor: SignerWithAddress
  let external: SignerWithAddress

  const createAutem = async (owner: string | SignerWithAddress, beneficiary: string | SignerWithAddress, window: ethers.BigNumberish, metadata: string = ""): Promise<ethers.Contract> => {
    const ownerAddr = typeof owner === 'string' ? owner : owner.address
    const beneficiaryAddr = typeof beneficiary === 'string' ? beneficiary : beneficiary.address

    await factory.create(ownerAddr, beneficiaryAddr, window, metadata)

    const salt = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['address', 'address', 'uint96', 'string'],
        [ownerAddr, beneficiaryAddr, window, metadata]
      )
    )

    const Proxy = await hethers.getContractFactory("Proxy")

    const addr = ethers.utils.getAddress(
      ethers.utils.hexDataSlice(
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ['bytes1', 'address', 'bytes32', 'bytes32'],
            ['0xff', factory.address, salt, ethers.utils.keccak256(
              ethers.utils.solidityPack(
                ['bytes', 'bytes32'],
                [Proxy.bytecode, ethers.utils.defaultAbiCoder.encode(['address'], [await factory.implementation()])]
              )
            )]
          )
        ),
        12
      )
    )

    const Autem = await hethers.getContractFactory("Autem")
    return Autem.attach(addr)
  }

  beforeEach(async () => {
    [owner, beneficiary, impostor, external] = await hethers.getSigners()

    const Factory = await hethers.getContractFactory("Factory")
    factory = await Factory.deploy()
  })

  it("Should create autem", async () => {
    const autem = await createAutem(owner, beneficiary, 86400)
    expect(await autem.owner()).to.equal(owner.address)
    expect(await autem.beneficiary()).to.equal(beneficiary.address)
    expect(await autem.window()).to.equal(ethers.BigNumber.from(86400))
  })

  it('Should fail to create autem for owner 0x0', async () => {
    const autem = createAutem(ethers.constants.AddressZero, beneficiary, 86400)
    await expect(autem).to.be.rejectedWith(RevertError('E400'))
  })

  describe("Use autem", async () => {
    let autem: ethers.Contract
    let window: ethers.BigNumber

    beforeEach(async () => {
      window = ethers.BigNumber.from(86400)
      autem = await createAutem(owner, beneficiary, window)
    })

    const options = [{
      name: 'Using owner',
      signer: () => owner,
      beforeEach: () => {}
    }, {
      name: 'Using owner after window',
      signer: () => owner,
      beforeEach: async () => { await advanceTime(window.add(1)) }
    }, {
      name: 'Using beneficiary after window',
      signer: () => beneficiary,
      beforeEach: async () => { await advanceTime(window.add(1000)) }
    }]

    options.map((o) => {
      context(o.name, () => {
        beforeEach(() => o.beforeEach())

        it('Should change owner', async () => {
          const newOwner = ethers.Wallet.createRandom()
          await autem.connect(o.signer()).setOwner(newOwner.address)
          expect(await autem.owner()).to.equal(newOwner.address)
        })

        it('Should change beneficiary', async () => {
          const newBeneficiary = ethers.Wallet.createRandom()
          await autem.connect(o.signer()).setBeneficiary(newBeneficiary.address)
          expect(await autem.beneficiary()).to.equal(newBeneficiary.address)
        })

        it('Should change window', async () => {
          const newWindow = ethers.BigNumber.from(600)
          await autem.connect(o.signer()).setWindow(newWindow)
          expect(await autem.window()).to.equal(newWindow)
        })

        it('Should change metadata', async () => {
          expect(await autem.metadata()).to.equal("")
          const metadata = "Did you ever hear the tragedy of Darth Plagueis the Wise? I thought not. It's not a story the Jedi would tell you."
          await autem.connect(o.signer()).setMetadata(metadata)
          expect(await autem.metadata()).to.equal(metadata)
        })

        it('Should receive ETH', async () => {
          await external.sendTransaction({
            to: autem.address,
            value: ethers.utils.parseEther("1")
          })

          expect(await hethers.provider.getBalance(autem.address)).to.equal(ethers.utils.parseEther("1"))
        })

        it('Should receive ETH with data', async () => {
          await external.sendTransaction({
            to: autem.address,
            value: ethers.utils.parseEther("1"),
            data: ethers.utils.randomBytes(96)
          })

          expect(await hethers.provider.getBalance(autem.address)).to.equal(ethers.utils.parseEther("1"))
        })

        it('Should receive call with data', async () => {
          await external.sendTransaction({
            to: autem.address,
            data: ethers.utils.randomBytes(96)
          })

          expect(await hethers.provider.getBalance(autem.address)).to.equal(ethers.constants.Zero)
        })

        it('Should send ETH', async () => {
          await external.sendTransaction({
            to: autem.address,
            value: ethers.utils.parseEther("1"),
            data: ethers.utils.randomBytes(96)
          })

          const recipient = ethers.Wallet.createRandom()

          await autem.connect(o.signer()).execute(
            recipient.address,
            ethers.utils.parseEther("0.25"),
            "0x"
          )

          expect(await hethers.provider.getBalance(autem.address)).to.equal(ethers.utils.parseEther("0.75"))
          expect(await hethers.provider.getBalance(recipient.address)).to.equal(ethers.utils.parseEther("0.25"))
        })

        it('Should send ETH with DATA', async () => {
          await external.sendTransaction({
            to: autem.address,
            value: ethers.utils.parseEther("1"),
            data: ethers.utils.randomBytes(96)
          })

          const recipient = ethers.Wallet.createRandom()

          await autem.connect(o.signer()).execute(
            recipient.address,
            ethers.utils.parseEther("0.25"),
            ethers.utils.randomBytes(96)
          )

          expect(await hethers.provider.getBalance(autem.address)).to.equal(ethers.utils.parseEther("0.75"))
          expect(await hethers.provider.getBalance(recipient.address)).to.equal(ethers.utils.parseEther("0.25"))
        })

        it('Should call contract', async () => {
          const altAutem = await createAutem(autem.address, ethers.constants.AddressZero, window)

          const newOwner = ethers.Wallet.createRandom()

          await autem.connect(o.signer()).execute(
            altAutem.address,
            ethers.constants.Zero,
            altAutem.interface.encodeFunctionData('setOwner', [newOwner.address])
          )

          expect(await altAutem.owner()).to.equal(newOwner.address)
        })

        it('Should fail to change owner to zero', async () => {
          const tx = autem.connect(o.signer()).setOwner(ethers.constants.AddressZero)
          await expect(tx).to.be.rejectedWith(RevertError('E400'))
        })

        it('Should fail to use unauthorized sender', async () => {
          const tx = autem.connect(impostor).setOwner(impostor.address)
          await expect(tx).to.be.rejectedWith(RevertError('E401'))
        })

        it('Should ping on call', async () => {
          const recipient = ethers.Wallet.createRandom()
          const prevTimestamp = await autem.lastPing()

          const tx = await autem.connect(o.signer()).execute(
            recipient.address,
            ethers.constants.Zero,
            "0x"
          )

          if (o.signer() !== beneficiary) {
            const timestamp = (await hethers.provider.getBlock(tx.blockHash)).timestamp
            expect(await autem.lastPing()).to.equal(timestamp)
            expect(timestamp).to.not.equal(prevTimestamp)
            expect((await tx.wait()).logs.length).to.equal(2)
          } else {
            expect(await autem.lastPing()).to.equal(prevTimestamp)
            expect((await tx.wait()).logs.length).to.equal(1)
          }
        })

        it('Should ping on self-call', async () => {
          const prevTimestamp = await autem.lastPing()

          const tx = await autem.connect(o.signer()).execute(
            autem.address,
            ethers.constants.Zero,
            "0x"
          )

          if (o.signer() !== beneficiary) {
            const timestamp = (await hethers.provider.getBlock(tx.blockHash)).timestamp
            expect(await autem.lastPing()).to.equal(timestamp)
            expect(timestamp).to.not.equal(prevTimestamp)
            expect((await tx.wait()).logs.length).to.equal(1)
          } else {
            expect(await autem.lastPing()).to.equal(prevTimestamp)
            expect((await tx.wait()).logs.length).to.equal(0)
          }
        })
      })
    })

    context('Using beneficiary', () => {
      it('Should fail before window', async () => {
        const tx = autem.connect(beneficiary).setOwner(beneficiary.address)
        await expect(tx).to.be.rejectedWith(RevertError("E425"))
      })
    })

    context('Proxy', () => {
      it('Should fail to setup main implementation', async () => {
        const Autem = await hethers.getContractFactory("Autem")
        const main = Autem.attach(await factory.implementation())

        const tx = main.setup(owner.address, beneficiary.address, 123, "")
        await expect(tx).to.be.rejectedWith(RevertError('E405'))
      })
      it('Should fail to re-setup autem', async () => {
        const tx = autem.setup(owner.address, beneficiary.address, 123, "")
        await expect(tx).to.be.rejectedWith(RevertError('E405'))
      })
    })
  })
})
