/**
 * Core Data Models for StatsDonkey
 * These structures define the shape of the data used throughout the application.
 */

export const HIT_TYPES = {
    GROUND_BALL: 'GROUND_BALL',
    LINE_DRIVE: 'LINE_DRIVE',
    FLY_BALL: 'FLY_BALL',
    POP_UP: 'POP_UP',
    BUNT: 'BUNT'
};

export const CONTACT_QUALITY = {
    SOFT: 'SOFT',
    AVERAGE: 'AVERAGE',
    HARD: 'HARD'
};

export const EVENT_TYPES = {
    OUT: 'OUT',
    STRIKEOUT: 'STRIKEOUT',
    WALK: 'WALK',
    SINGLE: 'SINGLE',
    DOUBLE: 'DOUBLE',
    TRIPLE: 'TRIPLE',
    HOME_RUN: 'HOME_RUN',
    ERROR_REACHED: 'ERROR_REACHED',
    FIELDER_CHOICE: 'FIELDER_CHOICE'
};

/**
 * Represents a single play or event during an at-bat.
 */
export const createGameEvent = ({
    id = crypto.randomUUID(),
    batterId,
    inning,
    isTopInning,
    eventType, // from EVENT_TYPES
    hitType = null, // from HIT_TYPES
    contactQuality = null, // from CONTACT_QUALITY
    location = null, // { x, y } coordinates on the field (0-100 scale)
    rbi = 0,
    runsScored = 0,
    outsRecorded = 0,
    runnerAdvancements = [] // Array of { runnerId, fromBase, toBase, outOnPlay }
}) => ({
    id,
    batterId,
    inning,
    isTopInning,
    eventType,
    hitType,
    contactQuality,
    location,
    rbi,
    runsScored,
    outsRecorded,
    runnerAdvancements,
    timestamp: Date.now()
});

/**
 * Represents a player on a roster.
 */
export const createPlayer = ({
    id = crypto.randomUUID(),
    name,
    number = '',
    positions = [],
    isSubstitute = false,
    stats = {} // Will accumulate career stats here later
}) => ({
    id,
    name,
    number,
    positions,
    isSubstitute,
    stats
});

/**
 * Represents a complete Team.
 */
export const createTeam = ({
    id = crypto.randomUUID(),
    name,
    isMyTeam = false,
    roster = [] // Array of Player objects
}) => ({
    id,
    name,
    isMyTeam,
    roster
});

/**
 * Represents the current state of an active Game.
 */
export const createGameState = ({
    id = crypto.randomUUID(),
    myTeamId,
    opponentTeamId,
    myLineup = [], 
    opponentLineup = [], 
    myBench = [],
    opponentBench = [],
    date = new Date().toISOString()
}) => ({
    id,
    myTeamId,
    opponentTeamId,
    date,
    status: 'IN_PROGRESS', 
    inning: 1,
    isTopInning: true,
    outs: 0,
    score: { away: 0, home: 0 },
    lineScore: { away: [0], home: [0] },
    hits: { away: 0, home: 0 },
    errors: { away: 0, home: 0 },
    bases: {
        first: null,
        second: null,
        third: null
    },
    currentBatterIndex: { myTeam: 0, opponent: 0 },
    myLineup,
    opponentLineup,
    myBench,
    opponentBench,
    events: [] 
});
