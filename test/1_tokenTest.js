const OmensToken = artifacts.require('OmensToken.sol')

contract('OmensToken', (accounts) => {

	const _name = 'Omens';
	const _symbol = 'OMN';
	const _decimals = 18;
	const _inicialSupply = 1000000;

	
	beforeEach(async () => {
		this.token = await OmensToken.new(_inicialSupply);
	})

	describe('atrributes', () =>{
		it('has the correct name', async () =>{
			const name = await this.token.name();
			assert.equal(name, _name)
		});

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
		    let threw = false;
		    try {
		      await this.token.transferFrom.call(accounts[ 0 ], accounts[ 2 ], 60, { from: accounts[ 1 ] });
		    } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		});

		it('attempt withdrawal from account with no allowance (should fail)', async () => {
		    let threw = false;
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
		    let threw = false;
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



		    //transfer to treasury
		    const transferLogTreas = res.logs.find(
		      element2 => element2.event.match('Transfer') &&
		        element2.args.to.toString().match('0xc52416eeED3942e7A1a6A9b4f3eCd437d3bC034F')
		    );



// investigar como traer variables desde el contrato de Omens (treasuryPercentage)
//		    const percentage = await this.token.treasuryPercentage
//		    console.log(percentage)



			const percentage = 2;
		    assert.strictEqual(transferLogTreas.args.to.toString(), '0xc52416eeED3942e7A1a6A9b4f3eCd437d3bC034F');
		    assert.strictEqual(transferLogTreas.args.value.toString(), Math.round(2666* percentage / 100).toString());

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
**/
});