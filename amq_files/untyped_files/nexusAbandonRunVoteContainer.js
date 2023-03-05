'use strict';
/*exported NexusAbandonRunVoteContainer*/

class NexusAbandonRunVoteContainer extends BaseVoteContainer {
	constructor() {
		super($("#nexusAbandonRunVoteContainer"), "abandon run vote result");

		this._nexusAbandonRunVoteStartListener = new Listener("nexus abandon run vote start", (payload) => {
			let voteStarter = payload.startPlayer === selfName;
			this.startVote(voteStarter, false, payload.duration, 0);
		});
		this._nexusAbandonRunVoteStartListener.bindListener();
	}

	vote(votedFor) {
		socket.sendCommand({
			type: "nexus",
			command: "abandon run vote",
			data: {
				accept: votedFor,
			},
		});
	} 

}