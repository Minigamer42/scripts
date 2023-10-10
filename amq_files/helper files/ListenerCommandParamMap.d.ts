declare type ListenerCommandParamMap = {
    'login complete': LoginComplete;
    'online player count change': OnlinePlayerCountChange;
    'New Rooms': NewRoom[];
    'Room Change': RoomChange;
    'friend state change': FriendStateChange;
    'friend social status change': FriendSocialStatusChange;
    'Host Game': HostGame;
    'Room Settings Changed': RoomSettingsChanged;
    'all online users': string[];
    'online user change': FriendStateChange;
    'New Spectator': NewSpectator;
    'chat message response': ChatMessageResponse;
    'Spectator Change To Player': NewPlayerElement;
    'join team': JoinTeam;
    'chat message': ChatMessage;
    'game chat update': GameChatUpdate;
    'Spectate Game': SpectateGame;
    'Change To Player': boolean;
    'Player Ready Change': PlayerReadyChange;
    'malLastUpdate update': Date;
    'anime list update result': AnimeListUpdateResult;
    'aniListLastUpdate update': Date;
    'New Player': NewPlayerElement;
    'Game Chat Message': Message;
    'Game Starting': GameStarting;
    'get all song names': GetAllSongNames;
    'quiz next video info': QuizNextVideoInfo;
    'quiz ready': QuizReady;
    'quiz waiting buffering': QuizWaitingBuffering;
    'play next song': PlayNextSong;
    'team member answer': TeamMemberAnswer;
    'quiz skip message': string;
    'player answered': number[];
    'quiz answer': QuizAnswer;
    'player answers': PlayerAnswers;
    'quiz xp credit gain': QuizXPCreditGain;
    'answer results': AnswerResults;
    'quiz overlay message': string;
    'quiz end result': QuizEndResult;
    'Player Left': PlayerLeft;
    'quiz over': QuizOver;
    'update all song names': UpdateAllSongNames;
    'new quest events': NewQuestEvents;
    'note update': NoteUpdate;
    'ticket update': TicketUpdate;
    'player profile': PlayerProfile2;
    'Spectator Left': SpectatorLeft;
    'return lobby vote start': ReturnLobbyVoteStart;
    'return lobby vote result': ReturnLobbyVoteResult;
    'ranked game state change': Ranked2;
    'popout message': PopoutMessage;
    'Host Promotion': HostPromotion;
    'player online change': FriendStateChange;
    'ranked standing updated': RankedStandingUpdated;
    'new player in game queue': NewPlayerInGameQueue;
    'join game queue': JoinGameQueue;
    'avatar change': AvatarChange;
    'Player Changed To Spectator': PlayerChangedToSpectator;
    'Join Game': JoinGame;
    'Rejoining Player': NewSpectator;
}

declare type Message = {
    sender: string;
    modMessage: boolean;
    message: string;
    teamMessage: boolean;
    messageId: number;
    emojis: GameChatMessageEmojis;
    badges: Badge[];
    atEveryone: boolean;
    nameColor: number;
    nameGlow: number;
}

declare type Badge = {
    name: string;
    fileName: string;
}

declare type GameChatMessageEmojis = {
    emotes: any[];
    customEmojis: any[];
}

declare type GameStarting = {
    gameMode: string;
    showSelection: number;
    groupSlotMap: GroupMap;
    players: GameStartingPlayer[];
    multipleChoice: boolean;
}

declare type GroupMap = {
    '1': number[];
}

declare type GameStartingPlayer = {
    gamePlayerId: number;
    pose: number;
    name: string;
    avatarInfo: HostAvatarClass;
    inGame: boolean;
    score: number;
    level: number;
    host: boolean;
    teamCaptain: boolean | null;
    teamPlayer: boolean | null;
    teamNumber: number;
    multiChoiceActive: boolean;
    correctGuesses: number;
    reviveScore: number;
    fallNumber: null;
    position: number;
    positionSlot: number;
}

declare type HostAvatarClass = {
    avatar: DescriptionClass;
    background: AvatarBackground;
}

declare type DescriptionClass = {
    avatarId?: number;
    colorId?: number;
    characterId?: number;
    active?: number;
    avatarName?: string;
    outfitName?: string;
    colorName?: string;
    backgroundFileName?: string;
    colorActive?: number;
    editor?: Editor | null;
    sizeModifier?: number;
    optionName?: string;
    optionActive?: boolean;
    emoteId?: number;
    tierId?: number;
    name?: string;
}

declare enum Editor {
    Kuroyuki = 'Kuroyuki',
    Lobolualua = 'Lobolualua',
    MelodyElodie = 'MelodyElodie',
    Shuuka = 'Shuuka',
    TaiOni = 'TaiOni',
}

declare type AvatarBackground = {
    avatarName: string;
    outfitName: string;
    backgroundHori: string;
    backgroundVert: string;
    colorId: number;
    avatarId: number;
}

declare type HostGame = {
    spectators: any[];
    inLobby: boolean;
    settings: Settings;
    inQueue: any[];
    hostName: string;
    gameId: number;
    players: NewPlayerElement[];
    numberOfTeams: number;
    teamFullMap: JoinGameQueue;
}

declare type NewPlayerElement = {
    name: string;
    gamePlayerId: number;
    level: number;
    avatar: HostAvatarClass;
    ready: boolean;
    inGame: boolean;
    teamNumber: number | null;
    multipleChoice: boolean;
}

declare type Settings = {
    roomName: string;
    privateRoom: boolean;
    password?: string;
    roomSize: number;
    numberOfSongs: number;
    teamSize: number;
    modifiers: Modifiers;
    songSelection: SongSelection;
    watchedDistribution: number;
    songType: SongType;
    openingCategories: Categories;
    endingCategories: Categories;
    insertCategories: Categories;
    guessTime: ExtraGuessTime;
    extraGuessTime: ExtraGuessTime;
    scoreType: number;
    answeringMode: number;
    showSelection: number;
    inventorySize: ExtraGuessTime;
    lootingTime: ExtraGuessTime;
    lives: number;
    samplePoint: ExtraGuessTime;
    playbackSpeed: PlaybackSpeed;
    songDifficulity: SongDifficulity;
    songPopularity: SongPopularity;
    playerScore: Score;
    animeScore: Score;
    vintage: Vintage;
    type: TypeClass;
    genre: any[];
    tags: any[];
    gameMode: string;
}

declare type Score = {
    advancedOn: boolean;
    standardValue: number[];
    advancedValue: boolean[];
}

declare type Categories = {
    instrumental: boolean;
    chanting: boolean;
    character: boolean;
    standard: boolean;
}

declare type ExtraGuessTime = {
    randomOn: boolean;
    standardValue: number;
    randomValue: number[];
}

declare type Modifiers = {
    skipGuessing: boolean;
    skipReplay: boolean;
    duplicates: boolean;
    queueing: boolean;
    lootDropping: boolean;
    rebroadcastSongs: boolean;
    dubSongs: boolean;
}

declare type PlaybackSpeed = {
    randomOn: boolean;
    standardValue: number;
    randomValue: boolean[];
}

declare type SongDifficulity = {
    advancedOn: boolean;
    standardValue: SongDifficulityStandardValue;
    advancedValue: number[];
}

declare type SongDifficulityStandardValue = {
    easy: boolean;
    medium: boolean;
    hard: boolean;
}

declare type SongPopularity = {
    advancedOn: boolean;
    standardValue: SongPopularityStandardValue;
    advancedValue: number[];
}

declare type SongPopularityStandardValue = {
    disliked: boolean;
    mixed: boolean;
    liked: boolean;
}

declare type SongSelection = {
    standardValue: number;
    advancedValue: SongSelectionAdvancedValue;
}

declare type SongSelectionAdvancedValue = {
    watched: number;
    unwatched: number;
    random: number;
}

declare type SongType = {
    standardValue: SongTypeStandardValue;
    advancedValue: SongTypeAdvancedValue;
}

declare type SongTypeAdvancedValue = {
    openings: number;
    endings: number;
    inserts: number;
    random: number;
}

declare type SongTypeStandardValue = {
    openings: boolean;
    endings: boolean;
    inserts: boolean;
}

declare type TypeClass = {
    tv: boolean;
    movie: boolean;
    ova: boolean;
    ona: boolean;
    special: boolean;
}

declare type Vintage = {
    standardValue: VintageStandardValue;
    advancedValueList: any[];
}

declare type VintageStandardValue = {
    years: number[];
    seasons: number[];
}

declare type JoinGameQueue = {}

declare type HostPromotion = {
    newHost: string;
}

declare type JoinGame = {
    spectators: any[];
    inLobby: boolean;
    settings: Settings;
    inQueue: any[];
    hostName: string;
    quizState: JoinGameQuizState;
    multipleChoice: boolean;
    teamAnswers: any[];
    selfAnswer: string;
}

declare type JoinGameQuizState = {
    state: number;
    songNumber: number;
    totalSongNumbers: number;
    players: GameStartingPlayer[];
    songInfo: NextVideoInfoClass;
    songTimer: number;
    guessTime: number;
    extraGuessTime: number;
    nextVideoInfo: NextVideoInfoClass;
    lastSkipMessage: string;
    progressBarState: ProgressBarState;
    returnVoteState: ReturnVoteState;
    groupSlotMap: GroupMap;
    pauseTriggered: boolean;
    inPauseEndTransition: boolean;
}

declare type NextVideoInfoClass = {
    videoInfo: VideoInfo;
    playLength: number;
    startPoint: number;
    playbackSpeed: number;
}

declare type VideoInfo = {
    videoMap: Map2;
    videoVolumeMap: VideoVolumeMap;
    id: number;
}

declare type Map2 = {
    catbox: { [key: string]: string };
}

declare type VideoVolumeMap = {
    catbox: { [key: string]: number };
}

declare type ProgressBarState = {
    length: number;
    played: number;
}

declare type ReturnVoteState = {
    active: boolean;
    returningToLobby: boolean;
}

declare type NewRoom = {
    id: number;
    host: string;
    hostAvatar: HostAvatarClass;
    settings: Settings;
    numberOfPlayers: number;
    numberOfSpectators: number;
    players: string[];
    inLobby: boolean;
}

declare type NewSpectator = {
    name: string;
    gamePlayerId: number | null;
}

declare type PlayerChangedToSpectator = {
    spectatorDescription: NewSpectator;
    playerDescription: NewSpectator;
    isHost: boolean;
}

declare type PlayerLeft = {
    player: NewSpectator;
}

declare type PlayerReadyChange = {
    gamePlayerId: number;
    ready: boolean;
}

declare type RoomChange = {
    changeType: string;
    roomId: number;
}

declare type RoomSettingsChanged = {
    numberOfSongs: number;
    scoreType: number;
    teamSize: number;
    songSelection: SongSelection;
    songType: SongType;
    numberOfTeams: number;
}

declare type SpectateGame = {
    spectators: NewSpectator[];
    inLobby: boolean;
    settings: Settings;
    inQueue: any[];
    hostName: string;
    quizState: SpectateGameQuizState;
    multipleChoice: boolean;
}

declare type SpectateGameQuizState = {
    state: number;
    songNumber: number;
    totalSongNumbers: number;
    players: PurplePlayer[];
    songInfo: NextVideoInfoClass;
    songTimer: number;
    guessTime: number;
    extraGuessTime: number;
    nextVideoInfo: NextVideoInfoClass;
    lastSkipMessage: null;
    progressBarState: ProgressBarState;
    returnVoteState: ReturnVoteState;
    groupSlotMap: GroupMap;
    pauseTriggered: boolean;
    inPauseEndTransition: boolean;
}

declare type PurplePlayer = {
    gamePlayerId: number;
    pose: number;
    name: string;
    avatarInfo: HostAvatarClass;
    inGame: boolean;
    score: number;
    level: number;
    host: boolean;
    teamCaptain: null;
    teamPlayer: null;
    teamNumber: null;
    multiChoiceActive: boolean;
    position: number;
    positionSlot: number;
}

declare type SpectatorLeft = {
    spectator: string;
    kicked: null;
}

declare type AnimeListUpdateResult = {
    success: boolean;
    message: string;
}

declare type AnswerResults = {
    players: AnswerResultsPlayer[];
    songInfo: SongInfo;
    progressBarState: ProgressBarState;
    groupMap: GroupMap;
    watched: boolean;
}

declare type AnswerResultsPlayer = {
    gamePlayerId: number;
    pose: number;
    level: number;
    correct: boolean;
    score: number;
    correctGuesses: number;
    reviveScore: number;
    fallNumber: null;
    position: number;
    positionSlot: number;
    listStatus?: number;
    showScore?: number;
}

declare type SongInfo = {
    animeNames: AnimeNames;
    artist: string;
    songName: string;
    videoTargetMap: Map2;
    type: number;
    typeNumber: number;
    annId: number;
    highRisk: number;
    animeScore: number;
    animeType: string;
    vintage: string;
    animeDifficulty: number;
    animeTags: string[];
    animeGenre: string[];
    altAnimeNames: string[];
    altAnimeNamesAnswers: any[];
    siteIds: SiteIDS;
}

declare type AnimeNames = {
    english: string;
    romaji: string;
}

declare type SiteIDS = {
    annId: number;
    malId: number;
    kitsuId: number;
    aniListId: number;
}

declare type AvatarChange = {
    gamePlayerId: number;
    avatar: HostAvatarClass;
}

declare type ChatMessage = {
    sender: string;
    message: string;
    emojis: ChatMessageEmojis;
    modMessage: boolean;
}

declare type ChatMessageEmojis = {
    emotes: any[];
    customEmojis: any[];
    shortCodes: string[];
}

declare type ChatMessageResponse = {
    msg: string;
    emojis: ChatMessageEmojis;
    target: string;
}

declare type FriendSocialStatusChange = {
    name: string;
    socialStatus: number;
    gameState: GameState;
}

declare type GameState = {
    inLobby: boolean;
    isSpectator: boolean;
    private: boolean;
    gameId: number | null;
    soloGame?: boolean;
}

declare type FriendStateChange = {
    online: boolean;
    name: string;
}

declare type GameChatUpdate = {
    bubles: any[];
    messages: Message[];
}

declare type GetAllSongNames = {
    names: string[];
    version: number;
}

declare type JoinTeam = {
    gamePlayerId: number;
    newTeam: number;
    newTeamFull: boolean;
    newTeamOpenNumber: null;
}

declare type LoginComplete = {
    xpInfo: XPInfo;
    level: number;
    friends: Friend[];
    blockedPlayers: any[];
    self: string;
    malName: null;
    malLastUpdate: null;
    credits: number;
    tickets: number;
    rhythm: number;
    avatar: HostAvatarClass;
    tutorial: number;
    defaultAvatars: DefaultAvatar[];
    unlockedDesigns: { [key: string]: { [key: string]: boolean } };
    characterUnlockCount: { [key: string]: number };
    avatarUnlockCount: { [key: string]: number };
    top5AvatarNominatios: Top5AvatarNominatio[];
    top5AllTime: Top5[];
    top5Montly: Top5[];
    top5Weekly: Top5[];
    recentDonations: RecentDonation[];
    driveTotal: null;
    gameAdmin: boolean;
    topAdmin: boolean;
    patreonId: null;
    backerLevel: number;
    badgeLevel: number;
    patreonBadgeInfo: PatreonBadgeInfo;
    freeDonation: number;
    settings: { [key: string]: number };
    aniList: null;
    aniListLastUpdate: null;
    kitsu: null;
    kitsuLastUpdate: null;
    useRomajiNames: number;
    genreInfo: GenreInfoElement[];
    tagInfo: GenreInfoElement[];
    customEmojis: any[];
    serverStatuses: FriendStateChange[];
    savedQuizSettings: SavedQuizSetting[];
    expandCount: number;
    videoHostNames: string[];
    rankedState: Ranked2;
    rankedLeaderboards: { [key: string]: Standing[] };
    rankedChampions: { [key: string]: RankedChampion[] };
    emoteGroups: EmoteGroup[];
    unlockedEmoteIds: number[];
    patreonDesynced: null;
    guestAccount: number;
    saleTax: number;
    recentEmotes: RecentEmote[];
    favoriteAvatars: FavoriteAvatar[];
    canReconnectGame: boolean;
    canReconnectNexus: boolean;
    rewardAlert: null;
    nameChangeTokens: number;
    tutorialState: TutorialState2;
    recentTicketRewards: RecentTicketReward[];
    avatarTokens: number;
    rollTargets: RollTarget[];
    discordClaimed: number;
    twitterClaimed: number;
    questDescriptions: QuestDescription[];
    questTokenProgress: number;
    displayArtContestPopUp: number;
    eventInfo: null;
    nexusStatBaseMax: number;
    nexusBuffs: NexusBuff[];
    saleInfo: SaleInfo;
}

declare type DefaultAvatar = {
    characterId: number;
    avatars: AvatarElement[];
}

declare type AvatarElement = {
    avatarId: number;
    outfitId: number;
    avatarName: string;
    outfitName: string;
    colorName: string;
    defaultColorId: number;
    backgroundVert: string;
    sizeModifier: number;
    optionName: string;
    active: number;
    defaultAvatar: number;
    exclusive: number;
    limited: number;
    notePrice: number;
    realMoneyPrice: number;
    artist: string;
    world: string;
    lore: string;
    patreonTierToUnlock: null;
    colors: Color[];
    badgeFileName: string;
    badgeName: string;
    tierId: number | null;
    legacy: number;
}

declare type Color = {
    name: string;
    price: number;
    colorId: number;
    active: number;
    defaultColor: number;
    backgroundVert: string;
    editor: Editor | null;
    limited: number;
    exclusive: number;
    tierId: number | null;
    sizeModifier: number;
    unique: number;
    eventColor: number;
}

declare type EmoteGroup = {
    name: string;
    orderNumber: number;
    emotes: Emote[];
}

declare type Emote = {
    emoteId: number;
    tierId: number;
    name: string;
}

declare type FavoriteAvatar = {
    favoriteId: number;
    avatar: FavoriteAvatarAvatar;
    background: FavoriteAvatarBackground;
}

declare type FavoriteAvatarAvatar = {
    avatarId: number;
    colorId: number;
    optionActive: boolean;
}

declare type FavoriteAvatarBackground = {
    avatarId: number;
    colorId: number;
}

declare type Friend = {
    name: string;
    online: boolean;
    avatarProfileImage: number | null;
    profileEmoteId: number | null;
    avatarName: string;
    outfitName: string;
    optionName: string;
    optionActive: number;
    colorName: string;
    status: number;
    gameState?: GameState | null;
}

declare type GenreInfoElement = {
    id: number;
    name: string;
}

declare type NexusBuff = {
    name: string;
    fileName: string;
    description: string;
    debuff: boolean;
}

declare type PatreonBadgeInfo = {
    current: Current;
    next: Current;
}

declare type Current = {
    name: string;
    fileName: string;
    unlockDescription: string;
    type: number;
    special: boolean;
    id: number;
}

declare type QuestDescription = {
    questId: number;
    name: string;
    state: number;
    targetState: number;
    ticketReward: number;
    noteReward: number;
    description: string;
    weekSlot: number;
}

declare type RankedChampion = {
    name: string;
    position: number;
}

declare type Standing = {
    name: string;
    score: number;
    position: number;
}

declare type Ranked2 = {
    state: number;
    serieId: number | null;
    games: Games;
}

declare type Games = {
    novice: boolean;
    expert: boolean;
}

declare type RecentDonation = {
    username: string;
    avatarName: string;
    amount: number;
}

declare type RecentEmote = {
    emoteId: number | null;
    emojiId: null;
    shortCode: null | string;
}

declare type RecentTicketReward = {
    type: TypeEnum;
    description: DescriptionClass;
    tier: number;
    rhythm: number;
}

declare enum TypeEnum {
    Color = 'color',
    Emote = 'emote',
}

declare type RollTarget = {
    id: number;
    name: string;
    fileName: string;
}

declare type SaleInfo = {
    endDate: Date;
    unlocksLeft: number;
}

declare type SavedQuizSetting = {
    id: number;
    name: string;
    settingString: string;
}

declare type Top5 = {
    name: string;
    amount: number;
}

declare type Top5AvatarNominatio = {
    name: string;
    value: number;
}

declare type TutorialState2 = {
    initialShow: number;
    lootingPlayed: number;
    teamPlayed: boolean;
    speedPlayed: boolean;
    livesPlayed: boolean;
    firstGameComplete: number;
    avatarCompleted: number;
    socialCompleted: number;
    rankedCompleted: number;
    nexusCityOverview: number;
    nexusDungeonMode: number;
    nexusDungeonLobby: number;
    nexusAvatarSelection: number;
    nexusDungeonMap: number;
    nexusDungeonCombat: number;
    nexusDungeonRewards: number;
    nexusCraftingStation: number;
    nexusWorkshop: number;
    nexusRuneSetup: number;
}

declare type XPInfo = {
    xpPercent: number;
    xpForLevel: number;
    xpIntoLevel: number;
    lastGain: number;
}

declare type NewPlayerInGameQueue = {
    name: string;
}

declare type NewQuestEvents = {
    events: Event2[];
    tokenProgress: number;
    tokenGained: boolean;
}

declare type Event2 = {
    questEvent: number;
    data: Data;
}

declare type Data = {
    newState: QuestDescription;
}

declare type NoteUpdate = {
    notes: number;
}

declare type OnlinePlayerCountChange = {
    count: number;
}

declare type PlayNextSong = {
    time: number;
    extraGuessTime: number;
    songNumber: number;
    progressBarState: ProgressBarState;
    onLastSong: boolean;
    multipleChoiceNames: null;
}

declare type PlayerAnswers = {
    answers: Answer[];
    progressBarState: null;
}

declare type Answer = {
    gamePlayerId: number;
    pose: number;
    answer: string;
}

declare type PlayerProfile2 = {
    name: string;
    originalName: string;
    level: number;
    profileEmoteId: number;
    avatarProfileImage: null;
    avatar: PlayerProfileAvatar;
    songCount: SongCount;
    guessPercent: CreationDate;
    creationDate: CreationDate;
    list: List;
    badges: any[];
    allBadges: any[];
}

declare type PlayerProfileAvatar = {
    avatarName: string;
    outfitName: string;
    optionName: string;
    colorName: string;
    optionActive: number;
}

declare type CreationDate = {
    hidden: boolean;
    value: string;
    adminView: boolean;
}

declare type List = {
    hidden: boolean;
    listId: number;
    listUser: string;
    listUserUrl: string;
    adminView: boolean;
}

declare type SongCount = {
    hidden: boolean;
    value: number;
    adminView: boolean;
}

declare type PopoutMessage = {
    header: string;
    message: string;
}

declare type QuizAnswer = {
    success: boolean;
    answer: string;
}

declare type QuizEndResult = {
    resultStates: ResultState[];
    progressBarState: ProgressBarState;
}

declare type ResultState = {
    gamePlayerId: number;
    pose: number;
    endPosition: number;
}

declare type QuizNextVideoInfo = {
    videoInfo: VideoInfo;
    startPont: number;
    playLength: number;
    playbackSpeed: number;
}

declare type QuizOver = {
    spectators: NewSpectator[];
    inLobby: boolean;
    settings: Settings;
    inQueue: any[];
    hostName: string;
    gameId: number;
    players: NewPlayerElement[];
    numberOfTeams: number;
    teamFullMap: { [key: string]: boolean };
}

declare type QuizReady = {
    numberOfSongs: number;
}

declare type QuizWaitingBuffering = {
    firstSong: boolean;
}

declare type QuizXPCreditGain = {
    gamePlayerId: number;
    xpInfo: XPInfo;
    level: number;
    credit: number;
    tickets: number;
}

declare type RankedStandingUpdated = {
    serieId: number;
    standings: Standing[];
}

declare type ReturnLobbyVoteResult = {
    passed: boolean;
    timeout: number;
}

declare type ReturnLobbyVoteStart = {
    invokingHost: string;
    voteDuration: number;
}

declare type TeamMemberAnswer = {
    answer: string;
    gamePlayerId: number;
}

declare type TicketUpdate = {
    tickets: number;
    avatarTokens: number;
}

declare type UpdateAllSongNames = {
    new: any[];
    deleted: any[];
    version: number;
}
