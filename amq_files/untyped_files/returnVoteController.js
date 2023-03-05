"use strict";
/*exported ReturnVoteController*/

class ReturnVoteController extends BaseVoteContainer {
	constructor(videoOverlay) {
		super($("#qpReturnLobbyVoteContainer"), "return lobby vote result", (passed) => {
			if (passed) {
				videoOverlay.showReturnToLobbyText();
			}
		});

		this.$VOTE_BUTTON = $("#qpReturnToLobbyButton");
		this.videoOverlay = videoOverlay;
	}

	startVote(defaultYes, disableVote, duration, timeAlreadyPlayed) {
		super.startVote(defaultYes, disableVote, duration, timeAlreadyPlayed);
		this.toggleVoteButton(false);
	}
	
	toggleVoteButton(on) {
		if (on) {
			this.$VOTE_BUTTON.removeClass("disabled");
		} else {
			this.$VOTE_BUTTON.addClass("disabled");
		}
	}

	reset() {
		super.reset();
		this.$VOTE_BUTTON.removeClass("disabled");
	}

	vote(votedFor) {
		socket.sendCommand({
			type: "quiz",
			command: "return lobby vote",
			data: {
				accept: votedFor,
			},
		});
	} 

	updateState(newState, isSpectator) {
		if (newState.active) {
			this.startVote(false, isSpectator, newState.duration, newState.timeLeft);
		} else if (newState.returningToLobby) {
			this.videoOverlay.showReturnToLobbyText();
		}
	}
}