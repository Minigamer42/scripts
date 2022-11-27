"use strict";

/*exported tutorial */
class Tutorial {
    constructor() {
        this.$container = $("#tutorialContainer");
        this.$blockerLayer = $("#tutorialBlocker");
        this.$tutorialTileContainer = $("#tutorialTileContainer");
        this.$tutorialRoomTile;

        this.messageContainer = new TutorialMessageContainer(this);
        this.optionContainer = new TutorialOptionController();
        this.state = {};
        this.inToturialGame = false;

        this.$modal = $("#tutorialModal");
        this.gameplayModalRow = new TutorialModalRow($("#tmGameplayRow"), () => {
            this.startFirstGameTutorial();
        });
        this.avatarModalRow = new TutorialModalRow($("#tmAvatarRow"), () => {
            this.startAvatarTutorial();
        });
        this.socialModalRow = new TutorialModalRow($("#tmSocialRow"), () => {
            this.startSocialTutorial();
        });

        this.currentTutorialState;
    }

    get showLooting() {
        return !this.state.lootingPlayed;
    }

    get showTeams() {
        return !this.state.teamPlayed;
    }

    get showSpeed() {
        return !this.state.speedPlayed;
    }

    get showLives() {
        return !this.state.livesPlayed;
    }

    set showLooting(newValue) {
        this.state.lootingPlayed = !newValue;
    }

    set showTeams(newValue) {
        this.state.teamPlayed = !newValue;
    }

    set showSpeed(newValue) {
        this.state.speedPlayed = !newValue;
    }

    set showLives(newValue) {
        this.state.livesPlayed = !newValue;
    }

    show() {
        this.$container.removeClass("hide");
        this.$blockerLayer.removeClass("hide");
    }

    hide() {
        this.$container.addClass("hide");
        this.$blockerLayer.addClass("hide");
    }

    createTutorialStates() {
        this.TUTORIAL_STATES = {
            WELCOME: [
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Hi and welcome to Anime Music Quiz!
					To get you started out, I suggest taking the quick tutorial to learn the basics of the game.
					There might even be some rewards at the end of it!`,
                    null,
                    null,
                    [
                        {
                            text: "Play Tutorial",
                            callback: () => {
                                this.displayState("WELCOME", 1);
                            }
                        },
                        {
                            text: "Skip Tutorial",
                            callback: () => {
                                this.displayState("WELCOME_DISMISS", 0);
                            }
                        }
                    ]
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Awesome, let's get you started on the tutorial then!`,
                    "WELCOME_NO_LIST",
                    0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    {
                        trigger: () => {
                            return options.gotAnimeList();
                        },
                        targetGruop: "FIRST_GAME",
                        targetNumber: 0
                    }
                )
            ],
            WELCOME_NO_LIST: [
                new TutorialState(
                    this,
                    "Add Anime List",
                    `To start out I can see that you don’t have an AniList, MyAnimeList or Kitsu user connected to your account. 
					I strongly recommend adding one, as it’ll allow the game to pick songs from shows you have watched.
					`,
                    null,
                    null,
                    [
                        {
                            text: "Don’t have one",
                            callback: () => {
                                this.displayState("WELCOME_NO_LIST", 1);
                            }
                        },
                        {
                            text: "Ok, let's add one",
                            callback: () => {
                                this.displayState("WELCOME_NO_LIST", 2);
                            }
                        },
                        {
                            text: "I’ll go without",
                            callback: () => {
                                this.displayState("WELCOME_NO_LIST_DISMISS", 0);
                            }
                        }
                    ]
                ),
                new TutorialState(
                    this,
                    "Add Anime List",
                    `You can easily set up one for free on one of the sites: <a href="https://anilist.co/" target="_blank">AniList</a>, <a href="https://myanimelist.net/" target="_blank">MyAnimeList</a> or <a href="https://kitsu.io/" target="_blank">Kitsu</a>.
					I’ll wait if you want to set one up now.`,
                    null,
                    null,
                    [
                        {
                            text: "Ok, I’ve created one",
                            callback: () => {
                                this.displayState("WELCOME_NO_LIST", 2);
                            }
                        },
                        {
                            text: "Maybe another time",
                            callback: () => {
                                this.displayState("WELCOME_NO_LIST_DISMISS", 0);
                            }
                        }
                    ]
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Perfect, lets get it connected to your AMQ account then!`,
                    "WELCOME_NO_LIST",
                    3,
                    null
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `First goes to the game settings by hovering the cog at the bottom right.
					Then select the settings category.`,
                    "WELCOME_NO_LIST",
                    4,
                    null,
                    [$("#footerMenuBar")],
                    [$("#menuBarOptionContainer"), $("#optionListSettings")],
                    [$("#menuBarOptionContainer"), $("#optionsContainer"), $("#optionListSettings")],
                    null,
                    null,
                    $("#optionListSettings")
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Now change to the Anime List tab.`,
                    "WELCOME_NO_LIST",
                    5,
                    null,
                    [$("#footerMenuBar")],
                    [$("#smAnimeListTab")],
                    [$("#menuBarOptionContainer"), $("#optionsContainer"), $("#optionListSettings")],
                    null,
                    null,
                    $("#smAnimeListTab")
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Enter your username for the site your list is on and click update.`,
                    "WELCOME_NO_LIST",
                    6,
                    null,
                    [$("#footerMenuBar")],
                    [$("#smAnimeListTab")],
                    [$("#menuBarOptionContainer"), $("#optionsContainer"), $("#optionListSettings")],
                    null,
                    null,
                    null,
                    ["malLastUpdate update", "aniListLastUpdate update", "kitsuLastUpdate update"]
                ),
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Perfect, the game will be able to select songs from shows you’ve watched now!
					So let's back to the main menu and get you into a game.`,
                    "FIRST_GAME",
                    0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    () => {
                        $("#settingModal").modal("hide");
                    }
                )
            ],
            WELCOME_NO_LIST_DISMISS: [
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `That’s fine, you can easily play without one.
					If you ever feel like adding one in the future, you can do it from the game settings found at the bottom right.`,
                    "FIRST_GAME",
                    0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                )
            ],
            WELCOME_DISMISS: [
                new TutorialState(
                    this,
                    "Welcome to AMQ",
                    `Another time then. 
					You can always find the tutorial in the menu at the bottom right.`,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "tutorial",
                            command: "tutorial skip"
                        });
                    }
                )
            ],
            FIRST_GAME: [
                new TutorialState(
                    this,
                    "Gameplay",
                    `Now let's get to what it’s all about and get you into a game so you can guess some shows!`,
                    "FIRST_GAME",
                    1,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `To start out, select “Play Multiplayer”. Don’t worry about the multiplayer part, I’m not going to put you up against veteran players from the get go.`,
                    "FIRST_GAME",
                    2,
                    null,
                    [$("#mainPage")],
                    [$("#mpPlayMultiplayer")],
                    [$("#mpPlayMultiplayer")],
                    null,
                    null,
                    $("#mpPlayMultiplayer")
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Here we have the room browser, where you can see the multiplayer games currently hosted and set up your own game if you can’t find one that suits your taste. `,
                    "FIRST_GAME",
                    3,
                    null,
                    [$("#roomBrowserPage"), $("#footerMenuBar")],
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `It can easily get pretty overwhelming, so there’s several filters you can use to find the rooms that match what you’re looking for at the top.`,
                    "FIRST_GAME",
                    4,
                    null,
                    [$("#roomBrowserPage"), $("#footerMenuBar")],
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `I’ve set up a game for you. The tile shows the most important of the settings, as a general rule, you can hover over most icons in the game to get a tooltip about what it is.
					Once you’re ready click join.`,
                    "FIRST_GAME",
                    5,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    ["Join Game"],
                    () => {
                        this.$tutorialRoomTile.addClass("hide");
                    },
                    () => {
                        this.$tutorialRoomTile.removeClass("hide");
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Here we have the lobby, in here you can see the other players and chat with them. I’m currently a spectator, so I won’t be playing in the game.
					Try clicking the Room Settings button at the top to inspect the settings.`,
                    "FIRST_GAME",
                    6,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    [$("#lnSettingsButton")],
                    [$("#lnSettingsButton")],
                    [$("#lobbyAvatarContainer")],
                    null,
                    $("#lnSettingsButton"),
                    null,
                    null,
                    () => {
                        this.inToturialGame = true;
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Anime Music Quiz allows quizzes to be customised using the many settings. Have a look around the settings, as with the room tile you can hover them to see what they do.`,
                    "FIRST_GAME",
                    7,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    [$("#lnSettingsButton")],
                    [$("#lnSettingsButton")],
                    [$("#lobbyAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Once you’re ready to continue, close the setting window and we’ll get the quiz started!
					You’ll have to ready-up at the top before I can start the game.`,
                    "FIRST_GAME",
                    8,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    [$("#lbStartButton")],
                    [$("#lbStartButton")],
                    [$("#lobbyAvatarContainer")],
                    null,
                    null,
                    ["quiz ready"],
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Here we have the quiz screen. When the round starts you’ll have 20 seconds to guess the show a given song is from and type it in the answer box.`,
                    "FIRST_GAME",
                    9,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `As you type out the answer, a suggestion list of anime names will appear below it, so you don’t have to type out the entire name. Do note that the answer has to be exact, so I recommended always using the suggestion list.`,
                    "FIRST_GAME",
                    10,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `I’ll start the round now, once you’ve entered your guess, submit it by pressing enter.`,
                    "FIRST_GAME",
                    11,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    ["player answers"],
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "quiz",
                            command: "tutorial start game"
                        });
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Once the guessing phase ends, all players' answers are revealed, before the correct answer is declared and the song replays with the visuals.`,
                    "FIRST_GAME",
                    12,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `At the end of the quiz, the player who guessed the most songs wins the quiz. 
					If you guess correctly you’ll also earn xp and the in-game currency notes.`,
                    "FIRST_GAME",
                    13,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    ["answer results"],
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "quiz",
                            command: "tutorial continue to reveal"
                        });
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `That’s it for the basics of the quiz, I’ll let you finish up the remaining 4 songs!`,
                    "FIRST_GAME",
                    14,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `If you want to hurry things along, you can also skip to the end of the answering phase, once you’ve submitted an answer, by clicking the skip button left of your answer. You can skip the replay phase in the same way.`,
                    "FIRST_GAME",
                    15,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    ["quiz end result"],
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "quiz",
                            command: "tutorial continue to round two"
                        });
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `That was all the songs for this quiz! As a final reward for completing a quiz, you also receive additional xp and notes based on your performance, before the game returns to the lobby.`,
                    "FIRST_GAME",
                    16,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    null,
                    null,
                    [$("#qpOptionContainer"), $("#qpAnimeContainer"), $("#qpAvatarRow")],
                    null,
                    null,
                    ["quiz over"],
                    null,
                    null,
                    () => {
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `With this you should be ready to challenge yourself and others in AMQ! So let's return to the main menu by clicking “Leave” and then “Back” at the top left.`,
                    "FIRST_GAME",
                    17,
                    null,
                    [$("#gameChatPage"), $("#footerMenuBar")],
                    [$("#lbLeaveButton")],
                    null,
                    [$("#lbLeaveButton")],
                    null,
                    $("#lbLeaveButton"),
                    () => {
                        this.inToturialGame = false;
                    },
                    null,
                    null,
                    null,
                    {
                        trigger: () => {
                            return !this.state.firstGameComplete;
                        },
                        targetGruop: "FIRST_GAME",
                        targetNumber: 18
                    }
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `This is it for the game play tutorial!`,
                    "FIRST_GAME",
                    19,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `This is it for the game play tutorial, as it’s your first time completing it, here’s a reward of 3000 notes to help you start unlocking some avatars!`,
                    "FIRST_GAME",
                    19,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "tutorial",
                            command: "tutorial first game completed"
                        });
                        xpBar.setCredits(xpBar.currentCreditCount + this.NOTE_REWARD_SIZE);
                        this.state.firstGameComplete = true;
                        this.updateModalRowStates();
                    },
                    null
                ),
                new TutorialState(
                    this,
                    "Gameplay",
                    `Next up would be the avatar tutorial, which will go over how to unlock and use the different avatars in the game. Ready to get started on it?`,
                    null,
                    null,
                    [
                        {
                            text: "Yea, let’s get to it",
                            callback: () => {
                                this.displayState("AVATAR", 0);
                            }
                        },
                        {
                            text: "No, I’m good for now",
                            callback: () => {
                                this.displayState("DISSMISS", 1);
                            }
                        }
                    ],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                )
            ],
            AVATAR: [
                new TutorialState(
                    this,
                    "Avatars",
                    `Let's get started on Avatars 101 then! 
					The game features several avatars and skins you can unlock and use to represent yourself in games.`,
                    "AVATAR",
                    1,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `You can browse all the avatars by clicking the avatar button at the bottom right.`,
                    "AVATAR",
                    2,
                    null,
                    [$("#footerMenuBar")],
                    [$("#avatarUserImgContainer")],
                    [$("#avatarUserImgContainer")],
                    null,
                    null,
                    $("#avatarUserImgContainer"),
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Here we have the store window, at the top you can find the bar with all avatars available.`,
                    "AVATAR",
                    3,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `To the right you have the avatar filters at the top, and below the preview and additional info of the selected avatar. As with the quiz room tiles, you can hover the different icons and text to get a description of them.`,
                    "AVATAR",
                    4,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Feel free to have a look at the preview and info, once you’re done select Komugi in the avatar list and I’ll show you the different types of avatars and skins.`,
                    "AVATAR",
                    5,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    [$(".swTopBarAvatarImageContainer.Komugi")],
                    [$("#swTopBarContentContainer"), $(".swTopBarAvatarImageContainer.Komugi")],
                    [$("#swRightColumnBottom")],
                    null,
                    $(".swTopBarAvatarImageContainer.Komugi"),
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Avatars can have multiple skins split into one of 3 categories: Standard, exclusive and limited/unavailable.`,
                    "AVATAR",
                    6,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Standard skins can be unlocked using notes, these are earned by playing quizzes and guessing correctly.`,
                    "AVATAR",
                    7,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Exclusive skins can be unlocked by rolling them using tickets in the ticket system. Tickets are earned by leveling up, supporting the game on Patreon or bought directly.`,
                    "AVATAR",
                    8,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Limited skins work like exclusive skins, but are only available during specific times of the year, such as holidays and specific seasons, for the rest of the year they’re unavailable and can’t be unlocked.`,
                    "AVATAR",
                    9,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `With the types out of the way, try selecting the standard Komugi skin.`,
                    "AVATAR",
                    10,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer"), $("#swContentAvatarContainer")],
                    [$("#swRightColumnBottom")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    (state) => {
                        state.highlightElements = [$(".swAvatarTile.Komugi.Standard")];
                        state.enableSoloElements = [
                            $("#swTopBarContentContainer"),
                            $("#swContentAvatarContainer"),
                            $(".swAvatarTile.Komugi.Standard")
                        ];
                        state.$altTrigger = $(".swAvatarTile.Komugi.Standard");
                    }
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Here we have the versions you’ll actually be unlocking.
					Each skin has several different recolors that can be unlocked, and even some more advanced alternative versions of the skin. Feel free to have a look around before we continue.`,
                    "AVATAR",
                    11,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Each of the skin and each color has a separate cost. So once you’ve unlocked a skin, all the recolors will become cheaper!`,
                    "AVATAR",
                    12,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `The recolors and alternative versions marked with a ticket icon are unlocked through the ticket system. The color of the ticket shows their rarity in the ticket system.`,
                    "AVATAR",
                    13,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Besides getting them in the ticket system, they can also be unlocked by using rhythm, a separate currency earned through the ticket system.`,
                    "AVATAR",
                    14,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `That’s it for the avatar basics. If you’re interested in knowing more about the Ticket System, check out the Tickets tab. There’s also several emotes you can unlock for use in the chat and on your profile which can be found in the Emote tab.`,
                    "AVATAR",
                    15,
                    null,
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    {
                        trigger: () => {
                            return !this.state.avatarCompleted;
                        },
                        targetGruop: "AVATAR",
                        targetNumber: 16
                    },
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Speaking of profiles, that’s covered in the last tutorial. Let me know if you’re up for grabbing it now!`,
                    null,
                    null,
                    [
                        {
                            text: "Yea, let’s get to it",
                            callback: () => {
                                this.displayState("SOCIAL", 0);
                            }
                        },
                        {
                            text: "No, I’m good for now",
                            callback: () => {
                                this.displayState("DISSMISS", 1);
                            }
                        }
                    ],
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Avatars",
                    `Speaking of profiles, that’s covered in the last tutorial. Let me know if you’re up for grabbing it now!
					Also as this was your first time completing the avatar tutorial, here’s some notes to help get you towards unlocking your next skin!`,
                    null,
                    null,
                    [
                        {
                            text: "Yea, let’s get to it",
                            callback: () => {
                                this.displayState("SOCIAL", 0);
                            }
                        },
                        {
                            text: "No, I’m good for now",
                            callback: () => {
                                this.displayState("DISSMISS", 1);
                            }
                        }
                    ],
                    [$("#storeWindow"), $("#footerMenuBar")],
                    null,
                    [$("#swTopBarContentContainer")],
                    [$("#swRightColumnBottom"), $("#swContentAvatarContainer")],
                    null,
                    null,
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "tutorial",
                            command: "tutorial avatar completed"
                        });
                        xpBar.setCredits(xpBar.currentCreditCount + this.NOTE_REWARD_SIZE);
                        this.state.avatarCompleted = true;
                        this.updateModalRowStates();
                    },
                    null,
                    null,
                    null
                )
            ],
            SOCIAL: [
                new TutorialState(
                    this,
                    "Social",
                    `Here we are, the final tutorial! 
					This one will go over how your profile works and the friend system in the game. So to start out, open the social menu in the bottom left.`,
                    "SOCIAL",
                    1,
                    null,
                    [$("#footerMenuBar")],
                    [$("#mainMenuSocailButton")],
                    [$("#mainMenuSocailButton")],
                    null,
                    null,
                    $("#mainMenuSocailButton"),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `First off we have the friend list, any friends you add while you play will show up here. 
					This will allow you to see when they’re online, check out their profiles and even invite them to games.`,
                    "SOCIAL",
                    2,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `You can also access a list of all online users, by changing to the Online tab at the bottom of the menu.`,
                    "SOCIAL",
                    3,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `But we’ll save that for another time, as we’ll take a look at your profile now! 
					Click the profile to the right of the online tab and it should pop right up.`,
                    "SOCIAL",
                    4,
                    null,
                    [$("#footerMenuBar")],
                    [$("#socialTabProfile")],
                    [$("#socialTabProfile")],
                    null,
                    null,
                    $("#socialTabProfile"),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `Here we have your profile! Profiles show stats such as your anime list, age of the account  as well as how much and well you’ve played. It can also be used to display badges you’ve earned!`,
                    "SOCIAL",
                    5,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `At the bottom we have the options you can use on profiles, such as sending the player a message, friend request or game invite. You can even block or report the player if that becomes needed.`,
                    "SOCIAL",
                    6,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `Most of these options are grayed out for you, as you can’t do them on yourself. But if you click the dotted option to the right you will see the one option available to you on profile, editing it. 
					Try clicking it, and you should see the editing view.
					`,
                    "SOCIAL",
                    7,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    (state) => {
                        state.highlightElements = [$(".ppFooterOptionIcon.additional")];
                    },
                    (callback) => {
                        playerProfileController.editToggleOnListener = () => {
                            playerProfileController.editToggleOnListener = null;
                            callback();
                        };
                    }
                ),
                new TutorialState(
                    this,
                    "Social",
                    `Editing your profile allows you to update almost anything about it. You can show/hide the stats by clicking the eye to the left of it. You can change which anime list site is displayed, and even change your profile image to any emote you’ve unlocked through the ticket system!`,
                    "SOCIAL",
                    8,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `Any badges you unlock, for example by unlocking skins and playing the ranked game mode, you will be able to display on your profile as well.`,
                    "SOCIAL",
                    9,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `By changing to the chat view for badges, you can also set a badge to display beside your name in the in-game chat.
					Hovering the badges in the menu will also display how to unlock them.`,
                    "SOCIAL",
                    10,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `Finally you can also change your nickname, the name you appear as in-game, by clicking the edit bottom to the right of your username. Though this is limited to one change per year, and your original name will be viewable on your profile by hovering your nickname.`,
                    "SOCIAL",
                    11,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    {
                        trigger: () => {
                            return !this.state.socialCompleted;
                        },
                        targetGruop: "SOCIAL",
                        targetNumber: 12
                    },
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `And that’s all for the final tutorial. With all of them completed I hope you have a blast playing Anime Music Quiz!`,
                    null,
                    null,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ),
                new TutorialState(
                    this,
                    "Social",
                    `And that’s all for the final tutorial. With all of them completed I hope you have a blast playing Anime Music Quiz! And as a final reward for completing all the tutorials for the first time, here’s a final note reward!`,
                    null,
                    null,
                    null,
                    [$("#footerMenuBar")],
                    null,
                    [$("#socialTabProfile")],
                    null,
                    null,
                    null,
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "tutorial",
                            command: "tutorial social completed"
                        });
                        xpBar.setCredits(xpBar.currentCreditCount + this.NOTE_REWARD_SIZE);
                        this.state.socialCompleted = true;
                        this.updateModalRowStates();
                    },
                    null,
                    null,
                    null
                )
            ],
            DISSMISS: [
                new TutorialState(
                    this,
                    "Dismiss Tutorial",
                    `Done for now?
					If you want to pick up the tutorial at another time you can find it in the menu at the bottom right. Hope you have a blast playing Anime Music Quiz!`,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    () => {
                        socket.sendCommand({
                            type: "tutorial",
                            command: "tutorial skip"
                        });
                        if (this.inToturialGame) {
                            viewChanger.changeView("main");
                            this.inToturialGame = false;
                        }
                    }
                ),
                new TutorialState(
                    this,
                    "Dismiss Tutorial",
                    `That's fine.
					If you want to pick up the tutorial at another time you can find it in the menu at the bottom right. Hope you have a blast playing Anime Music Quiz!`,
                    null,
                    null,
                    null
                )
            ]
        };
    }

    setup(tutorialState) {
        this.state = tutorialState;
        this.createTutorialStates();

        new RoomTile(
            hostModal.getTutorialSettings(),
            "Hibiki",
            {
                avatar: {
                    avatarId: 80,
                    colorId: 428,
                    characterId: 1,
                    active: 1,
                    avatarName: "Hibiki",
                    outfitName: "Standard",
                    colorName: "red",
                    backgroundFileName: "Hibiki_standard_red_vert.svg",
                    colorActive: 1,
                    editor: null,
                    sizeModifier: 20,
                    optionName: "Headphones",
                    optionActive: true
                },
                background: {
                    avatarName: "Hibiki",
                    outfitName: "Standard",
                    backgroundHori: "Hibiki_standard_red_hori.svg",
                    backgroundVert: "Hibiki_standard_red_vert.svg",
                    colorId: 428,
                    avatarId: 80
                }
            },
            "Tutorial",
            0,
            1,
            [],
            true,
            {
                appendRoomTile: (tileHtml) => {
                    this.$tutorialRoomTile = $(tileHtml);
                    this.$tutorialRoomTile.addClass("hide");
                    this.$tutorialRoomTile.find(".rbrJoinButton").addClass("tcHighlightElement");
                    this.$tutorialTileContainer.append(this.$tutorialRoomTile);
                },
                removeRoomTile: () => {
                    //do nothing
                }
            },
            null,
            true,
            roomBrowser.$roomHider
        );

        this.updateModalRowStates();

        //Remove postive check, for debuging.
        if (!this.state.initialShow) {
            this.startFirstGameTutorial();
        }
    }

    startFirstGameTutorial() {
        this.startTutorialAt("WELCOME", 0);
    }

    startAvatarTutorial() {
        this.startTutorialAt("AVATAR", 0);
    }

    startSocialTutorial() {
        this.startTutorialAt("SOCIAL", 0);
    }

    startTutorialAt(stateName, stateNumber) {
        if (viewChanger.getCurrentView() === "main" && !viewChanger.inWindow) {
            this.$modal.modal("hide");
            storeWindow.reset();
            socialTab.close();
            this.displayState(stateName, stateNumber);
            this.show();
        } else {
            displayOption(
                "Return to Main Menu?",
                "The tutorial can only be taken from the main menu. If you return to the main menu you'll stop what you're currently doing.",
                "Return",
                "Stay",
                () => {
                    viewChanger.changeView("main");
                    storeWindow.reset();
                    socialTab.close();
                    this.$modal.modal("hide");
                    this.displayState(stateName, stateNumber);
                    this.show();
                }
            );
        }
    }

    displayState(stateName, stateNumber) {
        if (this.currentTutorialState) {
            this.currentTutorialState.clearState();
        }
        if (stateName) {
            let targetState = this.TUTORIAL_STATES[stateName][stateNumber];
            targetState.display();
            this.currentTutorialState = targetState;
        } else {
            this.hide();
        }
    }

    updateModalRowStates() {
        if (this.state.socialCompleted) {
            this.socialModalRow.setCompleted();
        } else if (this.state.avatarCompleted) {
            this.socialModalRow.setPending();
        }
        if (this.state.avatarCompleted) {
            this.avatarModalRow.setCompleted();
        } else if (this.state.firstGameComplete) {
            this.avatarModalRow.setPending();
        }
        if (this.state.firstGameComplete) {
            this.gameplayModalRow.setCompleted();
        } else {
            this.gameplayModalRow.setPending();
        }
    }
}

Tutorial.prototype.NOTE_REWARD_SIZE = 3000;

class TutorialMessageContainer {
    constructor(tutorialController) {
        this.$container = $("#tcMessageContainer");
        this.$exitButton = this.$container.find("#tcMessageExitButton");
        this.$continueButton = this.$container.find("#tcMessageNextButton");
        this.$titleText = this.$container.find("#tcTopBarText");
        this.$message = this.$container.find("#tcMessage");

        this.inExit = false;
        this.$exitButton.click(() => {
            if (this.inExit) {
                tutorialController.displayState(null, null);
            } else {
                displayOption("Exit Tutorial?", null, 'Exit', 'Cancel', () => {
                    tutorialController.displayState("DISSMISS", 0);
                    if (this.unbindTriggersFunction) {
                        this.unbindTriggersFunction();
                    }
                });
            }
        });

        this.nextStateGroup;
        this.nextStateNumber;
        this.hideTrigger;
        this.$continueButton.click(() => {
            if (this.hideTrigger) {
                this.hideTrigger();
                this.hide();
            } else {
                tutorialController.displayState(this.nextStateGroup, this.nextStateNumber);
            }
        });

        this.$container.click((event) => {
            event.stopPropagation();
        });
    }

    set text(text) {
        this.$message.html(text.replace(/\n/g, "<br/>"));
    }

    set title(text) {
        this.$titleText.text(text);
    }

    hide() {
        this.$container.addClass("hide");
    }

    show() {
        this.$container.removeClass("hide");
    }

    displayState({
                     title,
                     message,
                     nextStateGroupName,
                     nextStateNumber,
                     options,
                     $altTrigger,
                     triggerEvents,
                     hideTrigger,
                     customTriggerSetup
                 }) {
        this.text = message;
        this.title = title;
        this.inExit = nextStateGroupName === null;

        if (this.nextStateGroup === "SOCIAL") {
            this.$container.css("bottom", 250);
            this.$container.css("left", 545);
            this.$container.css("right", 'unset');
        } else {
            this.$container.css("bottom", "");
            this.$container.css("left", "");
            this.$container.css("right", "");
        }

        this.nextStateGroup = nextStateGroupName;
        this.nextStateNumber = nextStateNumber;
        this.hideTrigger = hideTrigger;

        if (options && options.length) {
            this.$exitButton.addClass("disabled");
            this.$continueButton.addClass("disabled");
        } else {
            this.$exitButton.removeClass("disabled");
            this.$continueButton.removeClass("disabled");
        }

        if (!this.hideTrigger && ($altTrigger || triggerEvents || customTriggerSetup)) {
            this.$continueButton.addClass("disabled");
        }

        this.show();
    }
}

class TutorialState {
    constructor(
        tutorialController,
        title,
        message,
        nextStateGroupName,
        nextStateNumber,
        options,
        popoutElements,
        highlightElements,
        enableSoloElements,
        enableElements,
        disableElements,
        $altTrigger,
        triggerEvents,
        onClear,
        onDisplay,
        hideTrigger,
        altTargetInfo,
        onDisplayConfig,
        customTriggerSetup
    ) {
        this.title = title;
        this.message = message;
        this._nextStateGroupName = nextStateGroupName;
        this._nextStateNumber = nextStateNumber;
        this.options = options;
        this.popoutElements = popoutElements;
        this.highlightElements = highlightElements;
        this.enableSoloElements = enableSoloElements;
        this.enableElements = enableElements;
        this.disableElements = disableElements;
        this.$altTrigger = $altTrigger;
        this.triggerEvents = triggerEvents;
        this.onClear = onClear;
        this.onDisplay = onDisplay;
        this.hideTrigger = hideTrigger;
        this.altTargetInfo = altTargetInfo;
        this.onDisplayConfig = onDisplayConfig;
        this.customTriggerSetup = customTriggerSetup;

        this.controller = tutorialController;
        this.msgContainer = tutorialController.messageContainer;
        this.optionContainer = tutorialController.optionContainer;

        this.unbindTriggersFunction;
    }

    get nextStateGroupName() {
        if (this.altTargetInfo && this.altTargetInfo.trigger()) {
            return this.altTargetInfo.targetGruop;
        }
        return this._nextStateGroupName;
    }

    get nextStateNumber() {
        if (this.altTargetInfo && this.altTargetInfo.trigger()) {
            return this.altTargetInfo.targetNumber;
        }
        return this._nextStateNumber;
    }

    display() {
        if (this.onDisplayConfig) {
            this.onDisplayConfig(this);
        }
        this.msgContainer.displayState(this);
        this.optionContainer.setupOptions(this.options);

        if (this.onDisplay) {
            this.onDisplay();
        }

        if (this.popoutElements) {
            this.popoutElements.forEach(($element) => {
                $element.addClass("tcPopoutElement");
            });
        }

        if (this.highlightElements) {
            this.highlightElements.forEach(($element) => {
                $element.addClass("tcHighlightElement");
            });
        }

        if (this.enableSoloElements) {
            this.enableSoloElements.forEach(($element) => {
                $element.addClass("tcEnableElementSolo");
            });
        }

        if (this.enableElements) {
            this.enableElements.forEach(($element) => {
                $element.addClass("tcEnableElement");
            });
        }

        if (this.$altTrigger) {
            let triggerFunction = () => {
                this.controller.displayState(this.nextStateGroupName, this.nextStateNumber);
                this.unbindTriggersFunction();
            };
            this.unbindTriggersFunction = () => {
                this.$altTrigger.off("click", null, triggerFunction);
                this.unbindTriggersFunction = null;
            };
            this.$altTrigger.click(triggerFunction);
        } else if (this.triggerEvents) {
            let listeners = [];
            this.triggerEvents.forEach((event) => {
                listeners.push(
                    new Listener(event, () => {
                        this.controller.displayState(this.nextStateGroupName, this.nextStateNumber);
                        this.unbindTriggersFunction();
                    })
                );
            });
            this.unbindTriggersFunction = () => {
                //Don't remove listeners doing execution as it can cause listeners to not be executed do to change in array
                setTimeout(() => {
                    listeners.forEach((listener) => listener.unbindListener());
                }, 1);
                this.unbindTriggersFunction = null;
            };
            listeners.forEach((listener) => listener.bindListener());
        } else if (this.customTriggerSetup) {
            this.customTriggerSetup(() => {
                this.controller.displayState(this.nextStateGroupName, this.nextStateNumber);
            });
        }
    }

    clearState() {
        if (this.popoutElements) {
            this.popoutElements.forEach(($element) => {
                $element.removeClass("tcPopoutElement");
            });
        }

        if (this.highlightElements) {
            this.highlightElements.forEach(($element) => {
                $element.removeClass("tcHighlightElement");
            });
        }

        if (this.enableSoloElements) {
            this.enableSoloElements.forEach(($element) => {
                $element.removeClass("tcEnableElementSolo");
            });
        }

        if (this.enableElements) {
            this.enableElements.forEach(($element) => {
                $element.removeClass("tcEnableElement");
            });
        }

        if (this.onClear) {
            this.onClear();
        }
    }
}

class TutorialOptionController {
    constructor() {
        this.$container = $("#tcOptionContainer");
        this.options = [];
        let options = this.$container.find(".tcOption");
        for (let i = 0; i < options.length; i++) {
            this.options.push(new TutorialOption($(options[i])));
        }
    }

    setupOptions(newOptions) {
        this.options.forEach((option) => option.hide());
        if (newOptions) {
            newOptions.forEach((entry, index) => {
                let optionEntry = this.options[index];
                optionEntry.displayOption(entry);
                optionEntry.show();
            });
        }
    }
}

class TutorialOption {
    constructor($container) {
        this.$container = $container;
        this.$text = this.$container.find(".tcOptionText");
        this.callback;

        this.$container.click(() => {
            if (this.callback) {
                this.callback();
            }
        });
    }

    set text(newValue) {
        this.$text.text(newValue);
    }

    displayOption({text, callback}) {
        this.text = text;
        this.callback = callback;
    }

    updateTextSize() {
        fitTextToContainer(this.$text, this.$container, 30, 10);
    }

    show() {
        this.$container.removeClass("hide");
        this.updateTextSize();
    }

    hide() {
        this.$container.addClass("hide");
    }
}

class TutorialModalRow {
    constructor($row, buttonEvent) {
        this.$row = $row;
        this.$button = $row.find(".btn");
        this.$text = $row.find(".tmRowStatus");

        this.$button.click(buttonEvent);
        this.setDisabled();
    }

    setPending() {
        this.$text.text("Unlocked");
        this.$text.removeClass("completed");
        this.$button.removeClass("disabled");
    }

    setCompleted() {
        this.$text.text("Completed");
        this.$text.addClass("completed");
        this.$button.removeClass("disabled");
    }

    setDisabled() {
        this.$text.text("Locked");
        this.$text.removeClass("completed");
        this.$button.addClass("disabled");
    }
}

// Tutorial.prototype.promptTutorial = function () {
// 	displayOption(
// 		"Welcome to Anime Music Quiz!",
// 		"To start off, do you want to take a quick introduction to the game? As part of the introduction you'll be awarded 7.000 Notes!",
// 		"Play Introduction",
// 		"Skip",
// 		() => {
// 			this.start();
// 		},
// 		() => {
// 			displayMessage(
// 				"Introduction Skipped",
// 				"You can always play the introduction at a later time, just select it from the menu"
// 			);
// 			socket.sendCommand({
// 				type: "tutorial",
// 				command: "tutorial skipped",
// 			});
// 		}
// 	);
// };

// Tutorial.prototype.start = function () {
// 	if (viewChanger.getCurrentView() === "main" && !viewChanger.inWindow) {
// 		this.$layer.removeClass("hide");
// 		this.$menuBar.addClass("disableZIndex");
// 		this.state = 1;
// 		this.updateState();
// 	} else {
// 		displayOption(
// 			"Return to Main Menu?",
// 			"The introduction can only be taken from the main menu. If you return to the main menu you'll stop what ever you're currently doing!",
// 			"Return",
// 			"Stay",
// 			() => {
// 				viewChanger.changeView("main");
// 				viewChanger.closeAllWindows();
// 				this.start();
// 			}
// 		);
// 	}
// };

var tutorial = new Tutorial();
