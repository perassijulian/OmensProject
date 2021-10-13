const GovToken = artifacts.require('GovToken.sol')

contract('GovToken', (accounts) => {

	const _name = 'GovToken';
	const _symbol = 'GOV';
	const _decimals = 18;
	const _inicialSupply = 1000000;

	
	beforeEach(async () => {
		this.token = await GovToken.new(_inicialSupply);
	})

	describe('atrributes', () =>{
		it('has the correct name', async () =>{
			const name = await this.token.name();
			assert.equal(name, _name)
		});
/**
		it('has the correct symbol', async () =>{
			const symbol = await this.token.symbol();
			assert.equal(symbol, _symbol)
		});
		it('has the correct decimals', async () =>{
			const decimals = await this.token.decimals();
			assert.equal(decimals.toString(), _decimals.toString())
		});

		it('creation: should create an initial balance of 1000000 for the creator', async () => {
			const balance = await this.token.balanceOf.call(accounts[0]);
			assert.equal(balance.toString(), _inicialSupply.toString());
		});
**/
	});
/**

	describe('transfers without approvals', () =>{
		it('ether transfer should be reversed.', async () => {
    		const balanceBefore =  await this.token.balanceOf.call(accounts[0]);
    		assert.strictEqual(balanceBefore.toString(), _inicialSupply.toString());

		    let threw = false;
		    try {
		      await web3.eth.sendTransaction({ from: accounts[ 0 ], to: this.token.address, value: web3.utils.toWei('10', 'Ether') });
		    } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);

		    const balanceAfter =  await this.token.balanceOf.call(accounts[0]);
		    assert.strictEqual(balanceAfter.toString(), _inicialSupply.toString());
		});
		
		it('should transfer 10000 to accounts[1]', async () => {
		    await this.token.transfer(accounts[1], 10000, { from: accounts[0] });
		    const balance = await this.token.balanceOf.call(accounts[1]);
		    assert.strictEqual(balance.toString(), '10000');
		});

		it('should handle zero-transfers normally', async () => {
    		assert(await this.token.transfer.call(accounts[ 1 ], 0, { from: accounts[ 0 ] }), 'zero-transfer has failed');
  		});
	}); 

	describe('approvals', () =>{

		it('msg.sender should approve 100 to accounts[1]', async () => {
		    await this.token.approve(accounts[ 1 ], 100, { from: accounts[ 0 ] });
		    const allowance = await this.token.allowance(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance.toString(), '100');
		});

		it('msg.sender approves accounts[1] of 100 & withdraws 20 once.', async () => {
		    const balance0 = await this.token.balanceOf.call(accounts[ 0 ]);
		    assert.strictEqual(balance0.toString(), _inicialSupply.toString());

		    await this.token.approve(accounts[ 1 ], 100, { from: accounts[ 0 ] }); // 100
		    const balance2 = await this.token.balanceOf.call(accounts[ 2 ]);
		    assert.strictEqual(balance2.toString(), '0', 'balance2 not correct');

		    await this.token.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 20, { from: accounts[ 1 ] });
		    await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    await this.token.transferFrom(accounts[ 0 ], accounts[ 2 ], 20, { from: accounts[ 1 ] }); // -20
		    const allowance01 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance01.toString(), '80'); // =80

		    const balance22 = await this.token.balanceOf.call(accounts[ 2 ]);
		    assert.strictEqual(balance22.toString(), '20');

		    const balance02 = await this.token.balanceOf.call(accounts[ 0 ]);
		    assert.strictEqual(balance02.toString(), (	_inicialSupply-20).toString());
		    
		});

		it('msg.sender approves accounts[1] of 100 & withdraws 50 twice.', async () => {
		    await this.token.approve(accounts[ 1 ], 100, { from: accounts[ 0 ] });
		    const allowance01 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance01.toString(), '100');

		    await this.token.transferFrom(accounts[ 0 ], accounts[ 2 ], 50, { from: accounts[ 1 ] });
		    const allowance012 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance012.toString(), '50');

		    const balance2 = await this.token.balanceOf.call(accounts[ 2 ]);
		    assert.strictEqual(balance2.toString(), '50');

		    const balance0 = await this.token.balanceOf.call(accounts[ 0 ]);
		    assert.strictEqual(balance0.toString(), (_inicialSupply-50).toString());

		    // FIRST tx done.
		    // onto next.
		    await this.token.transferFrom(accounts[ 0 ], accounts[ 2 ], 50, { from: accounts[ 1 ] });
		    const allowance013 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance013.toString(), '0')

		    const balance22 = await this.token.balanceOf.call(accounts[ 2 ]);
		    assert.strictEqual(balance22.toString(), '100');

		    const balance02 = await this.token.balanceOf.call(accounts[ 0 ]);
		    assert.strictEqual(balance02.toString(), (_inicialSupply-100).toString());	 
		});

		it('msg.sender approves accounts[1] of 100 & withdraws 50 & 60 (2nd tx should fail)', async () => {
		    await this.token.approve(accounts[ 1 ], 100, { from: accounts[ 0 ] });
		    const allowance01 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance01.toString(), '100');

		    await this.token.transferFrom(accounts[ 0 ], accounts[ 2 ], 50, { from: accounts[ 1 ] });
		    const allowance012 = await this.token.allowance.call(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance012.toString(), '50');

		    const balance2 = await this.token.balanceOf.call(accounts[ 2 ]);
		    assert.strictEqual(balance2.toString(), '50');

		    const balance0 = await this.token.balanceOf.call(accounts[ 0 ]);
		    assert.strictEqual(balance0.toString(), (_inicialSupply-50).toString());

		    // FIRST tx done.
		    // onto next.
		    var threw = false;
		    try {
		      await this.token.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 60, { from: accounts[ 1 ] });
		    } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		});

		it('attempt withdrawal from account with no allowance (should fail)', async () => {
		    var threw = false;
		    try {
		      await this.token.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 60, { from: accounts[ 1 ] });
		    } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		})

		it('allow accounts[1] 100 to withdraw from accounts[0]. Withdraw 60 and then approve 0 & attempt transfer (should fail)', async () => {
		    await this.token.approve(accounts[ 1 ], 100, { from: accounts[ 0 ] });
		    await this.token.transferFrom(accounts[ 0 ], accounts[ 2 ], 60, { from: accounts[ 1 ] });
		    await this.token.approve(accounts[ 1 ], 0, { from: accounts[ 0 ] });
		    var threw = false;
		    try {
		      await this.token.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 10, { from: accounts[ 1 ] });
		    } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		});

		it('approve max (2^256 - 1)', async () => {
		    await this.token.approve(accounts[ 1 ], '115792089237316195423570985008687907853269984665640564039457584007913129639935', { from: accounts[ 0 ] });
		    const allowance = await this.token.allowance(accounts[ 0 ], accounts[ 1 ]);
		    assert.strictEqual(allowance.toString(), '115792089237316195423570985008687907853269984665640564039457584007913129639935');
		});
	});

	describe('events', () =>{

		it('should fire Transfer event properly', async () => {
		    const res = await this.token.transfer(accounts[ 1 ], '2666', { from: accounts[ 0 ] });
		    
			//transfer to account[1]
		    const transferLogAcc = res.logs.find(
		      element => element.event.match('Transfer') &&
		        element.address.match(this.token.address) &&
		        element.args.value.toString().match('2666')
		    );
		    
		    assert.strictEqual(transferLogAcc.args.from, accounts[ 0 ]);
		    // L2 ETH transfer also emits a transfer event
		    assert.strictEqual(transferLogAcc.args.to, accounts[ 1 ]);
		    assert.strictEqual(transferLogAcc.args.value.toString(), '2666');
		});

		it('should fire Transfer event normally on a zero transfer', async () => {
		    const res = await this.token.transfer(accounts[ 1 ], '0', { from: accounts[ 0 ] });
		    const transferLog = res.logs.find(
		      element => element.event.match('Transfer') &&
		        element.address.match(this.token.address) &&
		        element.args.from.match(accounts[ 0 ])
		    );
		    assert.strictEqual(transferLog.args.from, accounts[ 0 ]);
		    assert.strictEqual(transferLog.args.to, accounts[ 1 ]);
		    assert.strictEqual(transferLog.args.value.toString(), '0');
		});

		it('should fire Approval event properly', async () => {
		    const res = await this.token.approve(accounts[ 1 ], '2666', { from: accounts[ 0 ] });
		    const approvalLog = res.logs.find(element => element.event.match('Approval'));
		    assert.strictEqual(approvalLog.args.owner, accounts[ 0 ]);
		    assert.strictEqual(approvalLog.args.spender, accounts[ 1 ]);
		    assert.strictEqual(approvalLog.args.value.toString(), '2666');
		});
		
	});
*
	describe('delegate functions', () => {
		it('should delegate properly', async() => {

			// address
			await this.token.delegate(accounts[1], {from: accounts[0]});
			const delegatee = await this.token.delegates.call(accounts[0]);
			assert.strictEqual(delegatee, accounts[1]);

			//amount 
			balance0 = await this.token.balanceOf(accounts[0]);
			chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);
			assert.strictEqual(balance0.toString(), votes1.votes.toString());

		});

		it('should actualizate delegatee when delegate to a new one', async() => {
			
			const balance0 = await this.token.balanceOf(accounts[0]);

			// first delegate	
			
			await this.token.delegate(accounts[1], {from: accounts[0]});
			var delegatee1 = await this.token.delegates.call(accounts[0]);
			assert.strictEqual(delegatee1, accounts[1]);

			var chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			var votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);
			assert.strictEqual(balance0.toString(), votes1.votes.toString());

			// second delegate

			await this.token.delegate(accounts[2], {from: accounts[0]});
			var delegatee2 = await this.token.delegates.call(accounts[0]);
			assert.strictEqual(delegatee2, accounts[2]);

			var chPoint2 = await this.token.numCheckpoints.call(accounts[2]);
			var votes2 = await this.token.checkpoints.call(accounts[2], chPoint2 - 1);
			assert.strictEqual(balance0.toString(), votes2.votes.toString());

			// check remotion from account 1

			var chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			var votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);
			assert.strictEqual(votes1.votes.toString(), '0');

		});

		it('should reduce votes from delegatee when delegator transfer their funds', async() => {
			
			const balance0 = await this.token.balanceOf(accounts[0]);

			await this.token.delegate(accounts[1], {from: accounts[0]});
			var chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			var votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);
			assert.strictEqual(balance0.toString(), votes1.votes.toString());

			const transfer = 250;

			await this.token.transfer(accounts[2], transfer, {from: accounts[0]});

			var chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			var votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);

			const balance0_2 = balance0 - transfer;
			assert.strictEqual(balance0_2.toString(), votes1.votes.toString());
		});

		
		it("should have the amount of votes = your balance + delegator's ones", async () => {

			await this.token.transfer(accounts[1], 100, {from: accounts[0]});

			const balance0 = await this.token.balanceOf(accounts[0]);
			const balance1 = await this.token.balanceOf(accounts[1]);

			await this.token.delegate(accounts[1], {from: accounts[0]});

			var chPoint1 = await this.token.numCheckpoints.call(accounts[1]);
			var votes1 = await this.token.checkpoints.call(accounts[1], chPoint1 - 1);
			const votesTotal = parseInt(balance0) + parseInt(balance1)			
			
			assert.strictEqual(votesTotal.toString(), votes1.votes.toString());

		});

	});
**/
});