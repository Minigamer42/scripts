"use strict";
/*exported expandLibrary*/

function ExpandLibrary() {
	this.$view = $("#expandLibraryPage");
	this.$counterContainer = $("#elCounterContainer");
	this.$counter = $("#elExpandCount");

	this.lastUrl; //Set in sendUrlAnswer

	this.questionListHandler; //Setup in setup
	this.questionBox; //Setup in setup

	this.selectedSong;

	//Setup counter container to clear itself from the animation class after it finished
	var endFunction = () => {
		this.$counterContainer.removeClass("runAnimation");
	};
	this.$counterContainer
		.bind('webkitAnimationEnd', endFunction)
		.bind('animationEnd ', endFunction);

	this.gotQuestion;

	//Set in openView function	
	this.newQuestionHandler;

	this.open = false;
	$(window).resize(() => {
		if (this.open) {
			this.questionListHandler.updateScrollLayout();
		}
	});

	//Animation handlers
	this.particleAnimation = new ParticleAnimation();
	this.particleTrack = new ParticleTrack(this.$counterContainer, $("#xpLevelContainer"), PARTICLE_SPAWN_STRATEGIES.CIRCLE);
	this.particleAnimation.addTrack(this.particleTrack);

	//LISTNERS
	this._newAnswerListener = new Listener("expandLibrary song answered", function (answerInfo) {
		if(!answerInfo.animeStillAvaliable) {
			this.questionListHandler.removeAnime(answerInfo.annId);
		} else if(!answerInfo.songStillAvaliable) {
			this.questionListHandler.removeSong(answerInfo.annId, answerInfo.annSongId);
		} else {
			this.questionListHandler.setSongPending(answerInfo.annId, answerInfo.annSongId, answerInfo.host, answerInfo.resolution);
			this.questionListHandler.applyFilter();
		}
		
		if(this.selectedSong && this.selectedSong.annSongId === answerInfo.annSongId) {
			this.questionBox.setSongUploadStatusPending(answerInfo.host, answerInfo.resolution);
		}

		if(this.questionListHandler.isEmpty() && !this.selectedSong) {
			displayMessage("No More Questions", "Check back later for more", () => {
				viewChanger.changeView("main");
			});
		}
	}.bind(this));

	this._answerResultListener = new Listener("expandLibrary answer", function (result) {
		if(!result.succ) {
			displayMessage("Unable to Add URL", result.error);
		} else {
			//this.runXPAnimation(result.xpInfo, result.level, result.credits, result.tickets);
			this.$counter.text(parseInt(this.$counter.text()) + 1);
			this.questionBox.clearInput();
		}
		this.questionBox.setSubmitting(false);
		this._answerResultListener.unbindListener();
	}.bind(this));
}

ExpandLibrary.prototype.setup = function (expandCount) {
	this.$counter.text(expandCount);

	this.questionListHandler = new ExpandQuestionList();
	this.questionBox = new ExpandQuestionBox();

	let $faqModal = $("#expandFAQModal");
	let $faqHeadlines = $("#elFAQContent > h3");
	let $faqIndexPanels = $(".elFAQIndex");
	let indexEntryCount = Math.ceil($faqHeadlines.length / $faqIndexPanels.length);
	let indexPanelIndex = 0;
	$faqHeadlines.each(function(index) {
		if(index >= indexEntryCount + indexEntryCount * indexPanelIndex + 1) {
			indexPanelIndex++;
		}
		let $headline = $(this);
		let $indexPanel = $($faqIndexPanels[indexPanelIndex]);

		let $indexEntry = $("<p><a href='#'>" + $headline.text() + '</a></p>');

		$indexEntry.click(() => {
			$faqModal.scrollTop($headline.offset().top - 5);
		});

		$indexPanel.append($indexEntry);
	});
};


ExpandLibrary.prototype.runXPAnimation = function (xpInfo, level, credits, tickets) {
	this.particleTrack.buildTrack();
	this.particleTrack.setEndEvent(() => {
		xpBar.handleXpChange(xpInfo.xpPercent, xpInfo.xpForLevel, xpInfo.xpIntoLevel, level, xpInfo.lastGain);
		xpBar.setCredits(credits);
		xpBar.setTickets(tickets);
	});
	this.particleAnimation.startAnimation();
};

ExpandLibrary.prototype.closeView = function () {
	this._newAnswerListener.unbindListener();
	this.questionListHandler.resetFilterLayout();
	this.questionListHandler.clear();
	this.questionBox.reset();

	this.open = false;
	socket.sendCommand({
		type: "library",
		command: "expandLibrary closed",
	});

	afkKicker.setInExpandLibrary(false);
	this.$view.addClass("hidden");
};

ExpandLibrary.prototype.openView = function (callback) {
	if(guestRegistrationController.isGuest) {
		displayMessage('Unavailable for Guess Accounts', 'The Expand Library Feature is unavliable for guest accounts');
		viewChanger.changeView("main");
	} else if (xpBar.level < 5) {
		displayMessage("Level 5+ required", "To use the Expand Library function, you must be at least level 5");
		viewChanger.changeView("main");
	} else {
		this.open = true;
		//Add question listner
		this._newAnswerListener.bindListener();

		let questionListener = new Listener("expandLibrary questions", function (payload) {
			if (payload.success && payload.questions.length) {
				this.$view.removeClass("hidden");
				afkKicker.setInExpandLibrary(true);
				callback();
				this.questionListHandler.updateQuestionList(payload.questions);
			} else {
				if(payload.success) {
					displayMessage("No More Questions Avaliable", "Update your anime list or come back later for more questions");
				} else {
					displayMessage("Issue loading Expand Library questions", payload.issue);
				}
				viewChanger.changeView("main");
			}

			questionListener.unbindListener();
		}.bind(this));
		questionListener.bindListener();

		socket.sendCommand({
			type: "library",
			command: "expandLibrary questions"
		});
	}
};

ExpandLibrary.prototype.songOpened = function (songEntry) {
	if (this.selectedSong) {
		this.selectedSong.setOpen(false);
	}
	this.selectedSong = songEntry;
	this.questionBox.showSong(songEntry.animeId, songEntry.animeName, songEntry.name, songEntry.artist, songEntry.typeName, songEntry.versionStatus, songEntry.videoExamples);
};

ExpandLibrary.prototype.songClosed = function () {
	this.selectedSong = null;
	this.questionBox.reset();
};

ExpandLibrary.prototype.submitAnswer = function (url, resolution) {
	this.questionBox.setSubmitting(true);
	this._answerResultListener.bindListener();
	socket.sendCommand({
		type: "library",
		command: "expandLibrary answer",
		data: {
			annId: this.selectedSong.animeId,
			annSongId: this.selectedSong.annSongId,
			url: url,
			resolution: resolution
		}
	});
};

var expandLibrary = new ExpandLibrary();