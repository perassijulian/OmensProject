const { 
  time
} = require('@openzeppelin/test-helpers'); 


const Proposals = artifacts.require('Proposals.sol');
const GovToken = artifacts.require('GovToken.sol');

contract('Proposals', async (accounts) => {
	
	const [deployer, guardian, proposer, target1, target2, target3, target4, _] = accounts;

	const targets = [target1, target2, target3, target4];
	const values = [1000, 2000, 3000, 4000];
	const signatures = ['1AAA1AAA', '2BBB2BBB', '3CCC3CCC', '4DDDD4D'];
	const calldatas = [web3.utils.toHex(100), web3.utils.toHex(200), web3.utils.toHex(300), web3.utils.toHex(400)]
	const description = 'description of the proposal'

	beforeEach(async () => {
		this.token = await GovToken.new(web3.utils.toWei('20000'));
		const govTokenAddress = await this.token.address;
		proposal = await Proposals.new(govTokenAddress, guardian);
	});

/**
	describe('proposals', () => {

		it('should create new proposal', async () => {
			
			await this.token.delegate(proposer, {from: deployer})
			const res = await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
			const proposalLog = res.logs.find(
				element => element.event.match('ProposalCreated'));

			const propId = await proposal.proposalCount();
			const newProp = await proposal.proposals.call(propId);

			console.log('mapping: ', newProp)
			console.log('log: ', proposalLog)

// NEED TO REALIZE HOW TO STORE (OR CALL, BUT IDT) AN ARRAY INSIDE THE STRUCT

		});


		it('should register proposal properly', async () => {
			
			await this.token.delegate(proposer, {from: deployer});
			const res = await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
			const proposalLog = res.logs.find(
				element => element.event.match('ProposalCreated'));

			const length = targets.length;

			assert.strictEqual(
				proposalLog.args.targets.length,
				proposalLog.args.values.length, 
				proposalLog.args.signatures.length, 
				proposalLog.args.calldatas.length, 
				length
			);

			for (var i=0; i<length; i++){
				assert.strictEqual(proposalLog.args.targets[i].toString(), targets[i].toString());
				assert.strictEqual(proposalLog.args.values[i].toString(), values[i].toString());
				assert.strictEqual(proposalLog.args.signatures[i].toString(), signatures[i].toString());
//				assert.strictEqual(proposalLog.args.calldatas[i], web3.utils.toHex(calldatas[i]));
// HEX DOESN'T WANT TO WORK. ALSO I DONT EVEN KNOW WHAT'S THE USE FOR CALLDATA. CHECK 
			}	

		});



		it('should NOT allow make a proposal if there is not enought votes', async () => { 
			const minToPropose = web3.utils.fromWei( await proposal.proposalThreshold() );
			const notPropose = minToPropose - 1;

			await this.token.transfer(target1, notPropose , {from: deployer});
			await this.token.delegate(proposer, {from: target1});
			
			let threw = false;

		    try {
		    	await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer})
		    	//const vot = await proposal.priorVotes();
			    //console.log('vot: ', vot.toString());
			    //console.log('min: ', );
		      } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		});

		it('should NOT allow make a proposal if there is some missing data', async () => { 
			await this.token.delegate(proposer, {from: deployer});
			
			let threw = 0;

			const targets2 = targets.slice(0,-1);
			const values2 = values.slice(0,-1);
			const signatures2 = signatures.slice(0,-1);
			const calldatas2 = calldatas.slice(0,-1);

		    try {
		    	await proposal.propose(targets2, values, signatures, calldatas, description, {from: proposer})
		    	} catch (e) {
		      threw++;
		    }
		    assert.equal(threw, 1);
			
			try {
		    	await proposal.propose(targets, values2, signatures, calldatas, description, {from: proposer})
		    	} catch (e) {
		      threw++;
		    }
		    assert.equal(threw, 2);
		    
		    try {
		    	await proposal.propose(targets, values, signatures2, calldatas, description, {from: proposer})
		    	} catch (e) {
		      threw++;
		    }
		    assert.equal(threw, 3);

		    try {
		    	await proposal.propose(targets, values, signatures, calldatas2, description, {from: proposer})
		    	} catch (e) {
		      threw++;
		    }
		    assert.equal(threw, 4);
		});

		it('should NOT allow make a proposal if there is no data', async () => { 
			await this.token.delegate(proposer, {from: deployer});
			
			const targets2 = [];
			const values2 = [];
			const signatures2 = [];
			const calldatas2 = [];
			let threw = false;

		    try {
		    	await proposal.propose(targets2, values2, signatures2, calldatas2, description, {from: proposer})
		      } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		});

	});


	describe('voting system', () => {

		it('should not allow to vote proposals that are not Active', async() => {
//change this delegation, it should be amount + delegates
			const amountToVote = 1000;
			await this.token.transfer(target2, amountToVote, {from: deployer});
			await this.token.delegate(target1, {from: target2});
			
			await this.token.delegate(proposer, {from: deployer});
			await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
			
			try {
		    	await proposal.castVote(1, true, {from: target1});
		      } catch (e) {
		      threw = true;
		    }
		    assert.equal(threw, true);
		    
//I would like to do assert.equal(e, "Proposals::_castVote: voting is closed"); but IDK how to handle e 		    
		    
			await time.increase(time.duration.days(2));

			await proposal.castVote(1, true, {from: target1});

			const proposalVoted = await proposal.proposals.call(1);
			const amountVoted = proposalVoted.forVotes.toString();
			assert.equal(amountVoted, amountToVote.toString());			

		});

		it('checking positive and negative voting', async() => {
//change this delegation, it should be amount + delegates
			const amountToVoteFor = 1000;
			const amountToVoteAgainst = 750;
			
			await this.token.transfer(target3, amountToVoteFor, {from: deployer});
			await this.token.delegate(target1, {from: target3});
			
			await this.token.transfer(target4, amountToVoteAgainst, {from: deployer});
			await this.token.delegate(target2, {from: target4});
			
			await this.token.delegate(proposer, {from: deployer});
			await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
		    
			await time.increase(time.duration.days(2));

			await proposal.castVote(1, true, {from: target1});
			await proposal.castVote(1, false, {from: target2});

			const proposalVoted = await proposal.proposals.call(1);
			
			const amountVotedFor = proposalVoted.forVotes.toString();
			const amountVotedAgainst = proposalVoted.againstVotes.toString();
			assert.equal(amountVotedFor, amountToVoteFor.toString());
			assert.equal(amountVotedAgainst, amountToVoteAgainst.toString());
		});

// I would like to make it to be able to vote certain amount of the tokens. No necesarily
// all the tokens involved.
// I would love to do quadratic voting
// We still need to define time to start voting and to stop

	});
**/
	describe('auxiliar functions', () => {
		it('should return actions from proposal', async () => {
			await this.token.delegate(proposer, {from: deployer});
			await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
			
			const act = await proposal.getActions(1);
			console.log(act);
		});

		it('should return actions from proposal', async () => {
			await this.token.transfer(target2, 1000, {from: deployer});
			await this.token.delegate(target1, {from: target2});
			
			await this.token.delegate(proposer, {from: deployer});
			await proposal.propose(targets, values, signatures, calldatas, description, {from: proposer});
				    
			await time.increase(time.duration.days(2));

			await proposal.castVote(1, true, {from: target1});

			const rec = await proposal.getReceipt(1, target1);
			console.log(rec);
		});
	});
});
