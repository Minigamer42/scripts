"use strict";

/*exported QuizScoreboard*/

class QuizScoreboard {
    constructor() {
        this.$container = $("#qpStandingContainer");
        this._$animeCenterContainer = $("#qpAnimeCenterContainer");
        this.$quizScoreboardItemContainer = $("#qpStandingItemContainer");
        this.$quizScoreboardEntryContainer = $("#qpScoreBoardEntryContainer");
        this.$qpStandingCorrectCount = $("#qpStandingCorrectCount");
        this.groups = {};
        this.playerEntries = {};
        this.scoreType = null;
        this.teamMap = {};
        this.idsToRemove = [];

        this.activeGroup = null;

        this.showCorrect = false;

        this.$quizScoreboardItemContainer.perfectScrollbar({
            suppressScrollX: true,
            minScrollbarLength: 50
        });
    }

    updateLayout(groupMap) {
        let animeCenterContainerHeight = this._$animeCenterContainer.outerHeight(true);
        let topOffset = this.$container.outerHeight(true) - this.$container.outerHeight();
        let scoreboardHeight = animeCenterContainerHeight - topOffset - this.SCOREBOARD_BOTTOM_MARGIN;
        this.$container.css("max-height", scoreboardHeight);
        this.$quizScoreboardItemContainer
            .css("max-height", scoreboardHeight - this.SCOREBOARD_TITLE_HEIGHT)
            .perfectScrollbar("update");

        this.updateEntryLayout();
        this.updateGroupLayout(groupMap);
    }

    reset() {
        Object.values(this.playerEntries).forEach((entry) => {
            entry.remove();
        });
        Object.values(this.groups).forEach((entry) => {
            entry.remove();
        });
        Object.values(this.teamMap).forEach((entry) => {
            entry.remove();
        });
        this.playerEntries = {};
        this.groups = {};
        this.teamMap = {};
        this.idsToRemove = [];
        this.scoreType = null;
        this.activeGroup = null;
        this.$qpStandingCorrectCount.addClass("hide");
    }

    setScoreType(scoreType) {
        this.scoreType = scoreType;
    }

    setupGroups(groupMap) {
        if (Object.keys(groupMap).length > 1) {
            Object.keys(groupMap).forEach((groupNumber) => {
                let entry = new ScoreBoardGroup(groupNumber);
                this.groups[groupNumber] = entry;
                this.$quizScoreboardItemContainer.append(entry.$group);
            });
        }
    }

    resetupGroups(groupMap) {
        Object.values(this.groups).forEach((entry) => {
            entry.remove();
        });
        this.groups = {};
        if (Object.keys(groupMap).length > 1) {
            Object.keys(groupMap).forEach((groupNumber) => {
                let entry = new ScoreBoardGroup(groupNumber);
                this.groups[groupNumber] = entry;
                this.$quizScoreboardItemContainer.append(entry.$group);
            });
        }
        this.updateGroupLayout(groupMap);
        this.setActiveGroup(this.activeGroup);
    }

    setActiveGroup(groupNumber) {
        Object.keys(this.groups).forEach((groupKey) => {
            this.groups[groupKey].active = groupKey === groupNumber;
        });

        this.activeGroup = groupNumber;
    }

    setupPlayers(players, lives) {
        let startGuessCount = this.scoreType !== quiz.SCORE_TYPE_IDS.COUNT ? 0 : undefined;
        let startScore = this.scoreType === quiz.SCORE_TYPE_IDS.LIVES ? lives : 0;
        this.showCorrect = Object.values(players).length >= this.PLAYER_NEEDED_FOR_SHOWING_CORRECT;
        Object.values(players)
            .sort((a, b) => {
                return a.gamePlayerId - b.gamePlayerId;
            })
            .forEach((player) => {
                let life = player.avatarDisabled ? 0 : startScore;
                let entry = new ScoreBoardEntry(
                    player.name,
                    life,
                    1,
                    startGuessCount,
                    this.getScoreTitle(),
                    player.startPositionSlot,
                    player.inGame,
                    player.teamNumber,
                    player.hidden
                );

                this.playerEntries[player.gamePlayerId] = entry;

                if (player.teamNumber) {
                    this.addPlayerToTeam(entry, player.teamNumber);
                } else {
                    this.$quizScoreboardEntryContainer.append(entry.$entry);
                }
            });
        this.$quizScoreboardEntryContainer.height(Object.keys(players).length * ScoreBoardEntry.prototype.ENTRY_HEIGHT);
    }

    setupLatePlayers(newPlayers, playerCount) {
        let startGuessCount = undefined;
        let startScore = 0;
        newPlayers
            .sort((a, b) => {
                return a.gamePlayerId - b.gamePlayerId;
            })
            .forEach((player) => {
                let life = player.avatarDisabled ? 0 : startScore;
                let entry = new ScoreBoardEntry(
                    player.name,
                    life,
                    player.position,
                    startGuessCount,
                    this.getScoreTitle(),
                    player.positionSlot,
                    player.inGame,
                    player.teamNumber,
                    player.hidden
                );

                this.playerEntries[player.gamePlayerId] = entry;

                if (player.teamNumber) {
                    this.addPlayerToTeam(entry, player.teamNumber);
                } else {
                    this.$quizScoreboardEntryContainer.append(entry.$entry);
                }
            });
        this.$quizScoreboardEntryContainer.height(playerCount * ScoreBoardEntry.prototype.ENTRY_HEIGHT);
    }

    setupPlayersWithScore(players) {
        this.showCorrect = players.length >= this.PLAYER_NEEDED_FOR_SHOWING_CORRECT;
        let correctCount = 0;
        let gotCorrect = false;
        players.forEach((player) => {
            let entry = new ScoreBoardEntry(
                player.name,
                player.score,
                player.position,
                player.correctGuesses,
                this.getScoreTitle(),
                player.positionSlot,
                player.inGame,
                player.teamNumber,
                player.hidden
            );
            if (this.showCorrect) {
                entry.correct = player.correct;
                gotCorrect = true;
                if (player.correct) {
                    correctCount++;
                }
            }

            this.playerEntries[player.gamePlayerId] = entry;

            if (player.teamNumber) {
                this.addPlayerToTeam(entry, player.teamNumber);
            } else {
                this.$quizScoreboardEntryContainer.append(entry.$entry);
            }
        });

        this.$quizScoreboardEntryContainer.height(Object.keys(players).length * ScoreBoardEntry.prototype.ENTRY_HEIGHT);
        if (gotCorrect) {
            this.showCorrectCount(correctCount);
        }
    }

    addPlayerToTeam(entry, teamNumber) {
        if (!this.teamMap[teamNumber]) {
            this.teamMap[teamNumber] = new ScoreBoardTeamEntry(teamNumber);
            this.$quizScoreboardEntryContainer.append(this.teamMap[teamNumber].$body);
        }
        this.teamMap[teamNumber].addPlayerEntry(entry);
    }

    updateStandings(players, groupMap) {
        let correctCount = 0;
        players.forEach((player) => {
            let entry = this.playerEntries[player.gamePlayerId];
            entry.position = player.position;
            entry.positionSlot = player.positionSlot;
            entry.score = player.score;
            entry.guessCount = player.correctGuesses;
            if (this.showCorrect) {
                entry.correct = player.correct;
                if (player.correct) {
                    correctCount++;
                }
            }
        });
        if (this.showCorrect) {
            this.showCorrectCount(correctCount);
        }
        this.updateEntryLayout();
        if (Object.keys(this.teamMap).length) {
            this.updateGroupLayout(groupMap);
        }
        this.idsToRemove.forEach((id) => {
            this.playerEntries[id].remove();
            delete this.playerEntries[id];
        });
        this.idsToRemove = [];
    }

    updateEntryLayout() {
        if (Object.keys(this.teamMap).length) {
            let currentOffset = 0;
            Object.values(this.teamMap)
                .sort((a, b) => a.slotSortNumber - b.slotSortNumber)
                .forEach((entry) => {
                    entry.offset = currentOffset;
                    currentOffset += entry.height;
                });
        } else {
            Object.values(this.playerEntries).forEach((entry) => {
                entry.boardPosition = entry.positionSlot;
            });
        }
    }

    updateGroupLayout(groupMap) {
        let groupCount = groupMap ? Object.keys(groupMap).length : 0;
        if (groupCount > 1) {
            let currentStartOffset = 0;
            Object.keys(groupMap)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .forEach((groupNumber) => {
                    let topOffset = currentStartOffset;
                    let bottomOffset = topOffset;

                    if (Object.keys(this.teamMap).length) {
                        let teamNumberMap = {};
                        groupMap[groupNumber].forEach((gamePlayerId) => {
                            teamNumberMap[this.playerEntries[gamePlayerId].teamNumber] = true;
                        });
                        Object.keys(teamNumberMap).forEach((teamNumber) => {
                            bottomOffset += this.teamMap[teamNumber].height;
                        });
                    } else {
                        groupMap[groupNumber].forEach((gamePlayerId) => {
                            if (this.playerEntries[gamePlayerId]) {
                                bottomOffset += this.playerEntries[gamePlayerId].height;
                            }
                        });
                    }
                    this.groups[groupNumber].updatePosition(topOffset, bottomOffset);
                    currentStartOffset = bottomOffset;
                });
        }
    }

    scrollToGroup(groupNumber) {
        if (Object.keys(this.groups).length > 1) {
            this.$quizScoreboardItemContainer.animate(
                {
                    scrollTop: this.groups[groupNumber].topOffset - 3
                },
                1000
            );
        }
    }

    getScoreTitle() {
        if (this.scoreType === quiz.SCORE_TYPE_IDS.LIVES) {
            return "Lives";
        } else {
            return "Points";
        }
    }

    disableEntry(gamePlayerId) {
        this.playerEntries[gamePlayerId].disabled = true;
    }

    enableEntry(gamePlayerId) {
        this.playerEntries[gamePlayerId].disabled = false;
    }

    resetCorrect() {
        if (this.showCorrect) {
            Object.values(this.playerEntries).forEach((entry) => {
                entry.correct = false;
            });
            this.$qpStandingCorrectCount.addClass("hide");
        }
    }

    showCorrectCount(count) {
        this.$qpStandingCorrectCount.text(count);
        this.$qpStandingCorrectCount.removeClass("hide");
    }

    setEntryHidden(gamePlayerId) {
        this.playerEntries[gamePlayerId].displayHidden();
    }

    removeEntry(gamePlayerId) {
        this.idsToRemove.push(gamePlayerId);
    }
}

QuizScoreboard.prototype.SCOREBOARD_BOTTOM_MARGIN = 20; //px
QuizScoreboard.prototype.SCOREBOARD_TITLE_HEIGHT = 46.4; //px
QuizScoreboard.prototype.PLAYER_NEEDED_FOR_SHOWING_CORRECT = 9;
