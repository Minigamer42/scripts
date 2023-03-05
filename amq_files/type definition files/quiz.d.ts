declare class Quiz {
    public QUIZ_STATES: {
        PRESETUP: 0,
        LOADING: 1,
        WAITING_FOR_READY: 2,
        GUESS_PHASE: 3,
        ANSWER_PHASE: 4,
        SHOW_ANSWER_PHASE: 5,
        END_PHASE: 6,
        WAITING_BUFFERING: 7,
        WAITING_ANSWERS_PHASE: 8,
        BATTLE_ROYAL: 9,
        PAUSE: 10,
        WAIT_SHOW_ANSWER_PHASE: 11,
        EXTRA_GUESS_TIME: 15,
    };
    public SCORE_TYPE_IDS: { SPEED: 2; LIVES: 3; COUNT: 1 };
    public SHOW_SELECTION_IDS: { AUTO: 1; LOOTING: 2 };
    public TEAM_ANSWER_IN_CHAT_STATES: { NEVER: 0; OUT_OF_FOCUS: 1; ALWAYS: 2 };
    public NEXUS_DELAYED_EVENT_DELAY: 5000;
    public SKIP_PHASES: readonly [3, 15, 11, 5, 10];
    public SHOW_TIMER_PHASES: readonly [3, 15, 11];
    public CURRENT_BUFFER_FOCUS_PHASES: readonly [3, 15, 11, 4];
    public $view: JQuery;
    public $inputContainer: JQuery;
    public $startReturnToLobbyButton: JQuery;
    public $nexusTargetLayer: JQuery;
    public inputFocused: boolean;
    public onLastSong: boolean;
    public settingUpFirstSong: boolean;
    public inQuiz: boolean;
    public soloMode: boolean;
    public isHost: boolean;
    public enemyMap: any;
    public targetingPlayerId: number | null;
    public nextSongPlayLength: any;
    public autoVoteSkipTimeout: any;
    public players: any;
    public isSpectator: boolean;
    public skipSettings: any;
    public currentAbilityTarget: null;
    public videoOverlay: any;
    public infoContainer: any;
    public returnVoteController: any;
    public videoTimerBar: any;
    public skipController: any;
    public avatarContainer: any;
    public scoreboard: any;
    public answerInput: any;
    public pauseButton: any;
    public avatarAssetHandler: any;
    public flaggedMessageContainer: any;
    public lateJoinButton: any;
    public nexusAttackOrderContainer: any;
    public eventQueue: any;
    public gameMode: 'Solo' | 'Multiplayer' | 'Nexus' | 'Ranked';
    public _noSongsListner: Listener<'Quiz no songs'>;
    public _quizOverListner: Listener<'quiz over'>;
    public _sendFeedbackListner: Listener<'send feedback'>;
    public _playerLeaveListner: Listener<'Player Left'>;
    public _playerRejoiningListener: Listener<'Rejoining Player'>;
    public _spectatorLeftListener: Listener<'Spectator Left'>;
    public _quizreadyListner: Listener<'quiz ready'>;
    public _nextVideoInfoListener: Listener<'quiz next video info'>;
    public _playNextSongListner: Listener<'play next song'>;
    public _playerAnswerListner: Listener<'player answers'>;
    public _resultListner: Listener<'answer results'>;
    public _endResultListner: Listener<'quiz end result'>;
    public _waitingForBufferingListner: Listener<'quiz waiting buffering'>;
    public _xpCreditGainListner: Listener<'quiz xp credit gain'>;
    public _noPlayersListner: Listener<'quiz no players'>;
    public _playerAnswerListener: Listener<'player answered'>;
    public _skippingVideoListener: Listener<'quiz overlay message'>;
    public _skipMessageListener: Listener<'quiz skip message'>;
    public _returnVoteStartListner: Listener<'return lobby vote start'>;
    public _guessPhaseOverListner: Listener<'guess phase over'>;
    public _errorListener: Listener<'quiz fatal error'>;
    public _nameChangeListner: Listener<'player name change'>;
    public _pauseTriggerListener: Listener<'quiz pause triggered'>;
    public _unpauseTriggerListener: Listener<'quiz unpause triggered'>;
    public _returnVoteResultListener: Listener<'return lobby vote result'>;
    public _teamMemberAnswerListener: Listener<'team member answer'>;
    public _modMessageFlagListener: Listener<'mod message flag'>;
    public _messageFlagWarnedListener: Listener<'message flag warned'>;
    public _messageFlagBanListener: Listener<'message flag ban'>;
    public _playerHiddenListener: Listener<'player hidden'>;
    public _lateJoinTriggeredListener: Listener<'late join triggered'>;
    public _playerLateJoinListener: Listener<'player late join'>;
    public _nexusGameEventsListener: Listener<'nexus game events'>;
    public _extraGuessTimeListener: Listener<'extra guess time'>;
    public ownGamePlayerId: number | null;
    public teamMode: boolean;
    public champGame: boolean;
    public avatarSlotMap: any[];
    public currentAbilityTargetClickHandler: (target) => void;
    public currentAbilityMouseMoveHandler: (event) => void;
    public currentAbilityTargetClearHandler: () => void;
    public $currentAbilityTargetIcon: any;

    constructor();

    private _groupSlotMap: {};
    get groupSlotMap();
    set groupSlotMap(newMap);

    get ownGroupSlot();

    openView(callback);

    closeView(args);

    setupQuiz(
        players,
        isSpectator,
        quizState,
        settings,
        isHost,
        groupSlotMap,
        soloMode,
        teamAnswers,
        selfAnswer,
        champGame,
        enemies,
        avatarAssets
    );

    setInputInFocus(inFocus);

    skipClicked();

    promoteHost(newHostName: string);

    leave();

    viewSettings();

    videoReady(songId);

    startReturnLobbyVote();

    selectAvatarGroup(number: number);

    handleAutoHide(type: 1 | 2 | 3, watched: boolean, highRisk: boolean);

    handlePlayerOnlyChatPoint(on: boolean) ;

    handleNoEmotePoint(on: boolean);

    addLateJoinPlayer(player: { name: any; level: any; gamePlayerId: number; host: any; avatarInfo: any; points: any; inGame: boolean; positionSlot: any; teamPlayer: any; teamNumber: any; hidden: any; });

    updateEnemyTarget(targetPosition: string | number,
        targetPlayer: { gamePlayerId: number; setNexusTurn: (arg0: boolean) => void; targetIcon: any; });

    handleNexusEvent(event: { type: any; target: { type: string; identifier: string | number; dodged: any; crit: any; hp: any; shield: any; name: any; targetType: any; slot: any; }; dmg: any; attackEffectSet: any; displayZero: any; targetType: string; slot: string | number; newHp: any; amount: any; targetName: any; state: { position: string | number; defeated: any; targetSlot: string | number; slot: string | number; }; targetInfo: { position: string | number; lastTargetSlot: string | number; attackTimer: any; targetSlot: string | number; }; currentAvatar: string | number; attackTarget: string | number; nextAvatar: string | number; slots: any[]; targetPosition: string | number; targetId: string | number; newState: any; name: any; currentCooldown: any; buffInfo: any; hp: any; shield: any; change: any; assetName: any; action: any; events: any[]; skipDelay: any; delay: any; iconType: string; iconName: any; genreIds: any; seasonId: any; songInfo: any; sfxInfo: { sfx: any; sfxTimeingMs: any; }; },
        finishedCallback);

    getNexusTarget(targetType: string, slot: string | number);

    sortNexusEvents(events: any[]);

    updateSwapTarget(slotOne, slotTwo);

    clearSwapIcons();

    displayAbilityTarget($targetIcon, ability, mouseX, mouseY);

    clearAbilityTarget();

    handleNewNexusCharacterClick(quizPlayer);
}
