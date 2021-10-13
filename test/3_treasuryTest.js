const { 
  expectRevert, 
  time, 
  constants 
} = require('@openzeppelin/test-helpers'); 

const Treasury = artifacts.require('Treasury.sol');
const OmensToken = artifacts.require('OmensToken.sol');

contract('Treasury', async (accounts) => {
	let treasury, token;
	const [deployer, owner, otherAddress, _] = accounts;

	beforeEach(async () => {
		treasury = await Treasury.new(owner);
		token = await OmensToken.new(web3.utils.toWei('1'));
	});

	it('should lock and unlock token and ether', async () => {
		let contractEtherBalance, contractTokenBalance, ownerEtherBalance, ownerTokenBalance;
/*
		const etherAmount = web3.utils.toWei('1');
		const tokenAmount = web3.utils.toWei('1');

		await web3.eth.sendTransaction({
			from: owner,
			to: treasury.address,
			value: etherAmount
		});

		await token.approve(treasury.address, tokenAmount);
		await treasury.deposit(token.address, tokenAmount);
		contractEtherBalance = await web3.eth.getBalance(treasury.address);
		contractTokenBalance = await token.balanceOf(treasury.address);

		assert.strictEqual(contractEtherBalance.toString(), etherAmount);
		assert.strictEqual(contractTokenBalance.toString(), tokenAmount);

		await expectRevert(
			treasury.withdraw(token.address, tokenAmount, {from: otherAddress}),
			'only owner'
		);

		await expectRevert(
			treasury.withdraw(token.address, tokenAmount, {from: owner}),
			'too early'
		);

		await time.increase(time.duration.years(1));
		await treasury.withdraw(constants.ZERO_ADDRESS, etherAmount, {from: owner});
		await treasury.withdraw(token.address, tokenAmount, {from: owner});
		contractEtherBalance = await web3.eth.getBalance(treasury.address);
		contractTokenBalance = await token.balanceOf(treasury.address);
		ownerEtherBalance = await web3.eth.getBalance(owner);
		ownerTokenBalance = await token.balanceOf(owner)
		assert.strictEqual(contractEtherBalance.toString(), '0');
		assert.strictEqual(contractTokenBalance.toString(), '0');
		assert.strictEqual(ownerTokenBalance.toString(), tokenAmount);
		assert.strictEqual(ownerEtherBalance.toString().length, 20);
		assert.strictEqual(ownerEtherBalance.toString().slice(0, 2), '99');
*/
	});
}); 