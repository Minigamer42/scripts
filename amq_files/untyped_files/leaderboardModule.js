/*exported leaderboardModule*/
class LeaderboardModule {
	constructor() {
		this.levelLeaderboard = new Leaderboard(
			{
				self: {
					name: "self",
					$container: $("#lbmSelfList"),
					$tab: $("#lbmSelfTab"),
				},
				top: {
					name: "top",
					$container: $("#lbmTopList"),
					$tab: $("#lbmTopTab"),
				},
				friends: {
					name: "friends",
					$tab: $("#lbmFriendsTab"),
					$container: $("#lbmFriendsList"),
					scroll: true,
					scrollToSelf: true,
				},
			},
			(entry) => {
				return entry.rank ? entry.rank : "-";
			},
			(entry) => {
				return entry.level;
			}
		);
		this.rankedLeaderboard = new Leaderboard(
			{
				all: {
					name: "all",
					$tab: $("#lbmRankedAllTab"),
					$container: $("#lbmRankedAllList"),
					scroll: true,
					scrollToSelf: true,
				},
				friends: {
					name: "friends",
					$tab: $("#lbmRankedFriendsTab"),
					$container: $("#lbmRankedFriendsList"),
					scroll: true,
					scrollToSelf: true,
				},
				champs: {
					name: "champs",
					$tab: $("#lbmRankedChampsTab"),
					$container: $("#lbmRankedChampsList"),
					scroll: true,
				},
			},
			(entry) => {
				return entry.position;
			},
			(entry) => {
				return entry.score != undefined ? entry.score : "";
			}
		);

		this.rankedRegionLists = {};
		this.currentRankedRegion = 2;

		this.$modal = $("#leaderboardModal");
		this.$modal.on("show.bs.modal", function () {
			socket.sendCommand({
				type: "social",
				command: "get leaderboard level entries",
			});
		});
		this.$modal.on(
			"shown.bs.modal",
			function () {
				this.rankedLeaderboard.scrollToSelf("all");
			}.bind(this)
		);
		this.$modal.on("hide.bs.modal", function () {
			socket.sendCommand({
				type: "social",
				command: "stop leaderboard listning",
			});
		});

		this._allLevelEntriesListener = new Listener("all leaderboard level entries", (payload) => {
			this.levelLeaderboard.updateList("self", payload.self);
			this.levelLeaderboard.updateList("top", payload.top);
			this.levelLeaderboard.updateList("friends", payload.friends);
		});
		this._allLevelEntriesListener.bindListener();

		this._selfLevelEntriesListener = new Listener("self leaderboard level entries", (payload) => {
			this.levelLeaderboard.updateList("self", payload.self);
		});
		this._selfLevelEntriesListener.bindListener();

		this._topLevelEntriesListener = new Listener("top leaderboard level entries", (payload) => {
			this.levelLeaderboard.updateList("top", payload.top);
		});
		this._topLevelEntriesListener.bindListener();

		this._friendsLevelEntriesListener = new Listener("friends leaderboard level entries", (payload) => {
			this.levelLeaderboard.updateList("friends", payload.friends);
		});
		this._friendsLevelEntriesListener.bindListener();

		this._rankedStandingUpdatedListener = new Listener("ranked standing updated", (payload) => {
			this.updateRankedList(payload.serieId, payload.standings);
			this.updateRankedEntries();
		});
		this._rankedStandingUpdatedListener.bindListener();
		this._rankedChampionsUpdatedListener = new Listener("ranked champions updated", (payload) => {
			this.updateChampionList(payload.serieId, payload.champions);
			this.updateRankedEntries();
		});
		this._rankedChampionsUpdatedListener.bindListener();
	}

	show() {
		if (guestRegistrationController.isGuest) {
			displayMessage(
				"Unavailable for Guest Accounts",
				"Leaderboards are unavailable for guest accounts"
			);
			
		} else {
			this.$modal.modal("show");
		}
	}

	setup(regionRankedStandings, regionRankedChampions) {
		Object.keys(regionRankedStandings).forEach((region) => {
			this.updateRankedList(region, regionRankedStandings[region]);
		});
		Object.keys(regionRankedChampions).forEach((region) => {
			this.updateChampionList(region, regionRankedChampions[region]);
		});
		let cookieRegion = Cookies.get("leaderboard_ranked_region");
		this.setRankedRegion(cookieRegion ? parseInt(cookieRegion) : 2);
		if(cookieRegion) {
			switch(parseInt(cookieRegion)) {
				case 1: $("#lbmRankedCentralToggle").prop('checked',true); break;
				case 2: $("#lbmRankedWestToggle").prop('checked',true); break;
				case 3: $("#lbmRankedEastToggle").prop('checked',true); break;
			}
		}
	}

	updateRankedList(region, newList) {
		let friends = socialTab.getAllFriends();
		this.initRegionEntry(region);

		this.rankedRegionLists[region].all = newList;
		this.rankedRegionLists[region].friends = newList.filter((entry) => {
			return friends.includes(entry.name) || entry.name === selfName;
		});
	}

	updateChampionList(region, newList) {
		this.initRegionEntry(region);
		this.rankedRegionLists[region].champions = newList;
	}

	initRegionEntry(region) {
		if (!this.rankedRegionLists[region]) {
			this.rankedRegionLists[region] = {
				all: [],
				friends: [],
				champions: [],
			};
		}
	}

	updateRankedEntries() {
		let region = this.rankedRegionLists[this.currentRankedRegion];

		this.rankedLeaderboard.updateList("all", region.all);
		this.rankedLeaderboard.updateList("friends", region.friends);
		this.rankedLeaderboard.updateList("champs", region.champions);
	}

	setRankedRegion(region) {
		this.currentRankedRegion = region;
		this.updateRankedEntries();
		Cookies.set("leaderboard_ranked_region", this.currentRankedRegion, { expires: 365 });
	}
}

class Leaderboard {
	constructor(tabMap, formatRankFunction, formatScoreFunction) {
		this.tabMap = tabMap;
		this.formatRankFunction = formatRankFunction;
		this.formatScoreFunction = formatScoreFunction;

		this.tabBoard = new TabBoard(Object.values(this.tabMap), (entry) => {
			if (entry.scrollToSelf) {
				this.scrollToSelf(entry.name);
			}
		});

		Object.values(tabMap).forEach((entry) => {
			if (entry.scroll) {
				entry.$container.perfectScrollbar({
					suppressScrollX: true,
					minScrollbarLength: 50,
				});
			}
		});
	}

	updateList(listName, entries) {
		let tabEntry = this.tabMap[listName];
		let $container = tabEntry.$container;
		$container.find(".lbmBoardEntry").remove();
		entries.forEach((entry) => {
			let rank = this.formatRankFunction(entry);
			let score = this.formatScoreFunction(entry);
			let $entry = $(format(this.ENTRY_TEMPLATE, entry.name, score, rank));
			if (entry.name === selfName) {
				$entry.addClass("self");
			}
			$entry.click(() => {
				playerProfileController.loadProfile(entry.name, $entry, {}, () => {}, true, false);
			});
			$container.append($entry);
		});

		if (tabEntry.scroll) {
			$container.perfectScrollbar("update");
		}
		if (tabEntry.scrollToSelf) {
			this.scrollToSelf(listName);
		}
	}

	scrollToSelf(listName) {
		let $container = this.tabMap[listName].$container;
		let $self = $container.find(".self");
		if ($self.length) {
			let containerHeight = $container.height();
			let containerScroll = $container.scrollTop();
			let selfHeight = $self.height();
			let positionTop = $self.position().top;
			$container.scrollTop(containerScroll + positionTop - containerHeight / 2 + selfHeight / 2);
		}
	}
}
Leaderboard.prototype.ENTRY_TEMPLATE = $("#lbmListEntryTemplate").html();

class TabBoard {
	constructor(tabEntries, onShowHandler) {
		this.tabEntries = tabEntries;
		this.tabEntries.forEach((entry) => {
			entry.$tab.click(() => {
				this.clearSelected();
				entry.$tab.addClass("selected");
				entry.$container.removeClass("hide");
				if (entry.scroll) {
					entry.$container.perfectScrollbar("update");
				}
				onShowHandler(entry);
			});
		});
	}

	clearSelected() {
		this.tabEntries.forEach((entry) => {
			entry.$tab.removeClass("selected");
			entry.$container.addClass("hide");
		});
	}
}

var leaderboardModule = new LeaderboardModule();
