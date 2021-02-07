# Autem.eth

Autem is a Minimal Ethereum dApp for creating and managing decentralized testamentary wills and trusts. It uses a dead-man-switch contract to determine when a secondary owner (or beneficiary) should be able to access a given trust.

## About Autem

Cryptocurrency helps us to re-take control over one of the key aspects of our lives, money. It lets us hold, trade, lend and borrow funds without ever having to trust a third party, keeping our key and our money always in our possession.

Autem.eth adds another tool to the DeFi toolset, one that's usually overlooked; it provides means to manage our funds when we aren't here anymore.

With Autem, creating trusts or testamentary wills becomes a simple process.

1) Create a trust contract.
2) Choose a beneficiary and an owner.
3) Pick the duration of the dead-man-switch.

This process results in a new Ethereum contract; you can send funds to this contract to make them part of the trust.

The trust works using a dead-man-switch; this means that as long as you regularly use the contract, its funds can only be accessed by you (the owner). But if you stop interacting with the contract, a countdown triggers, and when it reaches zero, the beneficiary gains access to the trust and its funds.

### Is there a cost or fee?
No, creating or interacting with trusts is a free process, and it doesn't have any limits. The underlying blockchain charges transaction fees independently from Autem.

### Can the owner access the trust after the countdown?
Yes.

### How do I add multiple beneficiaries?
If you want different beneficiaries to receive different amounts, you should create multiple trust contracts; if you wish all beneficiaries to access the same trust contract, I recommend using a Gnosis safe wallet as the beneficiary of the trust.

### Can I add a description to my trust?
Yes, you can configure a name and a description. Keep in mind this information is stored in plain text on the underlying blockchain, so please be careful to don't include any personal or sensible information.

### Has the project been audited?
The project hasn't been formally audited yet; however, the contracts are designed to be as simple as possible and are easy to understand even with minimal technical knowledge.

### Why don't you add <this> feature?
Given the delicate nature of the project, I decided to keep functionality at a minimum. You can also achieve any more complex desired behavior by combining the project with other Ethereum tools.

### Can I deposit ERC20, NFTs, or any other kind of assets?
Yes. Withdrawing some assets may require manually encoding transaction data and calling a contract, but it's possible to store any asset.

### Can the same trust hold multiple asset types?
Yes.

### Can I deposit Bitcoin?
No. But you can deposit any Bitcoin wrapped into an ERC20 token.

### How do I access the site?
You can use the web app hosted on https://autem.eth.link/.

