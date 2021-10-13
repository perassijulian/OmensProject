// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Proposals {
    /// @notice The name of this contract
    string public constant name = "Proposals";

    /// @notice The number of votes in support of a proposal required in order for a quorum to be reached and for a vote to succeed
    function quorumVotes() public pure returns (uint) { return 400000e18; } // 400,000 = 4% of Comp
   
    /// @notice The number of votes required in order for a voter to become a proposer
    function proposalThreshold() public pure returns (uint) { return 10000e18; }

    /// @notice The maximum number of actions that can be included in a proposal
    function proposalMaxOperations() public pure returns (uint) { return 10; } // 10 actions

    /// @notice The delay before voting on a proposal may take place, once proposed
    function votingDelay() public pure returns (uint) { return 1; } // 1 block

    /// @notice The duration of voting on a proposal, in blocks
    function votingPeriod() public pure returns (uint) { return 17280; } // ~3 days in blocks (assuming 15s blocks)

    /// @notice The address of the governance token
    TokenInterface public token;

    /// @notice The address of the Governor Guardian
    address public guardian;

    /// @notice The total number of proposals
    uint public proposalCount;

    struct Proposal {
        //  Unique id for looking up a proposal
        uint id;

        //  Creator of the proposal
        address proposer;

        //  The timestamp that the proposal will be available for execution, set once the vote succeeds
        uint eta;

        //  the ordered list of target addresses for calls to be made
        address[] targets;

        //  The ordered list of values (i.e. msg.value) to be passed to the calls to be made
        uint[] values;

        //  The ordered list of function signatures to be called
        string[] signatures;

        //  The ordered list of calldata to be passed to each call
        bytes[] calldatas;

        //  The block at which voting begins: holders must delegate their votes prior to this block
        uint startBlock;

        //  The block at which voting ends: votes must be cast prior to this block
        uint endBlock;

        //  Current number of votes in favor of this proposal
        uint forVotes;

        //  Current number of votes in opposition to this proposal
        uint againstVotes;

        //  Flag marking whether the proposal has been canceled
        bool canceled;

        //  Flag marking whether the proposal has been executed
        bool executed;

        //  Receipts of ballots for the entire set of voters
        //mapping (address => Receipt) receipts;

    }

    // Receipts by Id
    mapping (uint => mapping (address => Receipt)) public receiptsById;


    

    /// @notice Ballot receipt record for a voter
    struct Receipt {
        //  Whether or not a vote has been cast
        bool hasVoted;

        //  Whether or not the voter supports the proposal
        bool support;

        //  The number of votes the voter had, which were cast
        uint96 votes;
    }

    /// @notice Possible states that a proposal may be in
    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    }

    /// @notice The official record of all proposals ever proposed
    mapping (uint => Proposal) public proposals;

    /// @notice The latest proposal for each proposer
    mapping (address => uint) public latestProposalIds;

    /// @notice An event emitted when a new proposal is created
    event ProposalCreated(
        uint id, 
        address proposer, 
        address[] targets, 
        uint[] values, 
        string[] signatures, 
        bytes[] calldatas, 
        uint startBlock, 
        uint endBlock, 
        string description
    );
    


    constructor(address token_, address guardian_) {
        token = TokenInterface(token_);
        guardian = guardian_;
    }
    
    uint256 priorVotes;

    function propose(
        address[] memory targets, 
        uint[] memory values, 
        string[] memory signatures, 
        bytes[] memory calldatas, 
        string memory description
    ) 
        public returns (uint) {

        require(token.getPriorVotes(msg.sender, block.number - 1) > proposalThreshold(), "Proposals::propose: proposer votes below proposal threshold");
        priorVotes = token.getPriorVotes(msg.sender, block.number - 1);


        require(targets.length == values.length && targets.length == signatures.length && targets.length == calldatas.length, "Proposals::propose: proposal function information arity mismatch");
        require(targets.length != 0, "Proposals::propose: must provide actions");
        require(targets.length <= proposalMaxOperations(), "Proposals::propose: too many actions");

        uint latestProposalId = latestProposalIds[msg.sender];
        if (latestProposalId != 0) {
          ProposalState proposersLatestProposalState = state(latestProposalId);
          require(proposersLatestProposalState != ProposalState.Active, "Proposals::propose: one live proposal per proposer, found an already active proposal");
          require(proposersLatestProposalState != ProposalState.Pending, "Proposals::propose: one live proposal per proposer, found an already pending proposal");
        }

        uint startBlock = block.number + votingDelay();
        uint endBlock = startBlock + votingPeriod();

        proposalCount++;
        Proposal memory newProposal = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            eta: 0,
            targets: targets,
            values: values,
            signatures: signatures,
            calldatas: calldatas,
            startBlock: startBlock,
            endBlock: endBlock,
            forVotes: 0,
            againstVotes: 0,
            canceled: false,
            executed: false
        });

// variable description is not stored in proposal, just when the event is emited. Should we add it to the mapping?

        proposals[newProposal.id] = newProposal;
        latestProposalIds[newProposal.proposer] = newProposal.id;

        emit ProposalCreated(newProposal.id, msg.sender, targets, values, signatures, calldatas, startBlock, endBlock, description);
        return newProposal.id;
    }

    function state(uint proposalId) public view returns (ProposalState) {
        require(proposalCount >= proposalId && proposalId > 0, "Proposals::state: invalid proposal id");
        Proposal storage proposal = proposals[proposalId];
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (block.number <= proposal.startBlock) {
            return ProposalState.Pending;
        } else if (block.number <= proposal.endBlock) {
            return ProposalState.Active;
        } else if (proposal.forVotes <= proposal.againstVotes || proposal.forVotes < quorumVotes()) {
            return ProposalState.Defeated;
        } else if (proposal.eta == 0) {
            return ProposalState.Succeeded;
        } else if (proposal.executed) {
            return ProposalState.Executed;
//        } else if (block.timestamp >= proposal.eta  + timelock.GRACE_PERIOD())) {
//            return ProposalState.Expired;
        } else {
            return ProposalState.Queued;
        }
    }

}
    
interface TokenInterface {
    function getPriorVotes(address account, uint blockNumber) external view returns (uint256);

} 