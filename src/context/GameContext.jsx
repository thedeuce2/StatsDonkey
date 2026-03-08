import React, { createContext, useReducer, useEffect, useContext } from 'react';

// Define the initial state structure
const initialState = {
    myTeam: null,
    opponents: [],
    currentGame: null,
    pastGames: [],
};

const initialGameState = {
    inning: 1,
    isTopInning: true, // true = Away batting, false = Home batting
    outs: 0,
    bases: { first: false, second: false, third: false },
    score: { away: 0, home: 0 },
    lineScore: {
        away: [0], // Array of runs per inning, indexed by inning - 1
        home: [0]
    },
    hits: { away: 0, home: 0 },
    errors: { away: 0, home: 0 },
    events: [], // Log of all plays for potential UNDO or stats later
};

export const GameContext = createContext();

export const useGame = () => {
    return useContext(GameContext);
};

// --- Reducer Actions ---
export const ACTIONS = {
    LOAD_STATE: 'LOAD_STATE',
    SET_MY_TEAM: 'SET_MY_TEAM',
    ADD_OPPONENT: 'ADD_OPPONENT',
    START_NEW_GAME: 'START_NEW_GAME',
    UPDATE_LINEUPS: 'UPDATE_LINEUPS',
    RECORD_PLAY: 'RECORD_PLAY',
    UNDO_PLAY: 'UNDO_PLAY',
    FINISH_GAME: 'FINISH_GAME',
};

function advanceRunners(bases, basesToAdvance, isHomeRun = false) {
    let runsScored = 0;
    const newBases = { ...bases };

    if (isHomeRun) {
        // Everyone on base scores, plus the batter
        runsScored += (bases.third ? 1 : 0);
        runsScored += (bases.second ? 1 : 0);
        runsScored += (bases.first ? 1 : 0);
        runsScored += 1;
        newBases.first = false;
        newBases.second = false;
        newBases.third = false;
    } else if (basesToAdvance === 1) { // Single
        runsScored += (bases.third ? 1 : 0);
        newBases.third = bases.second;
        newBases.second = bases.first;
        newBases.first = true;
    } else if (basesToAdvance === 2) { // Double
        runsScored += (bases.third ? 1 : 0);
        runsScored += (bases.second ? 1 : 0);
        newBases.third = bases.first;
        newBases.second = true;
        newBases.first = false;
    } else if (basesToAdvance === 3) { // Triple
        runsScored += (bases.third ? 1 : 0);
        runsScored += (bases.second ? 1 : 0);
        runsScored += (bases.first ? 1 : 0);
        newBases.third = true;
        newBases.second = false;
        newBases.first = false;
    }

    return { runsScored, newBases };
}

function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.LOAD_STATE:
            return { ...state, ...action.payload };

        case ACTIONS.SET_MY_TEAM:
            return { ...state, myTeam: action.payload };

        case ACTIONS.ADD_OPPONENT:
            return { ...state, opponents: [...state.opponents, action.payload] };

        case ACTIONS.START_NEW_GAME:
            return { ...state, currentGame: { ...initialGameState, ...action.payload } };

        case ACTIONS.UPDATE_LINEUPS:
            if (!state.currentGame) return state;
            const updatedGame = JSON.parse(JSON.stringify(state.currentGame));
            updatedGame.opponentLineup = action.payload.away;
            updatedGame.myLineup = action.payload.home;
            return { ...state, currentGame: updatedGame };

        case ACTIONS.RECORD_PLAY:
            if (!state.currentGame) return state;

            const play = action.payload; // { type: 'SINGLE', isOut: false, bases: 1, etc. }
            const gameCopy = JSON.parse(JSON.stringify(state.currentGame)); // Deep copy to safely mutate deeply nested objects

            // Save state snapshot *before* play for UNDO
            gameCopy.events.push({
                playInfo: play,
                stateBefore: JSON.parse(JSON.stringify(state.currentGame)) // heavy but safe for a few hundred events
            });

            // Apply explicit user-defined outcomes
            gameCopy.outs += play.outsRecorded || 0;
            const runsScored = play.runsScored || 0;

            const currentHalf = gameCopy.isTopInning ? 'away' : 'home';
            const defendingHalf = gameCopy.isTopInning ? 'home' : 'away';
            const currentInningIdx = gameCopy.inning - 1;

            if (runsScored > 0) {
                gameCopy.lineScore[currentHalf][currentInningIdx] = (gameCopy.lineScore[currentHalf][currentInningIdx] || 0) + runsScored;
                gameCopy.score[currentHalf] += runsScored;
            }
            gameCopy.bases = play.newBases || { first: false, second: false, third: false };

            // Initialize hits/errors if missing (for backwards compatibility mostly)
            if (!gameCopy.hits) gameCopy.hits = { away: 0, home: 0 };
            if (!gameCopy.errors) gameCopy.errors = { away: 0, home: 0 };

            // Check for Hits
            if (['1B', '2B', '3B', 'HR'].includes(play.hitType)) {
                gameCopy.hits[currentHalf] += 1;
            }

            // Check for Errors
            if (play.hitType === 'ROE' || play.errorDetail) {
                gameCopy.errors[defendingHalf] += 1;
            }

            // Advance the batter index
            if (gameCopy.isTopInning) {
                if (gameCopy.opponentLineup && gameCopy.opponentLineup.length > 0) {
                    gameCopy.currentBatterIndex.opponent = (gameCopy.currentBatterIndex.opponent + 1) % gameCopy.opponentLineup.length;
                }
            } else {
                if (gameCopy.myLineup && gameCopy.myLineup.length > 0) {
                    gameCopy.currentBatterIndex.myTeam = (gameCopy.currentBatterIndex.myTeam + 1) % gameCopy.myLineup.length;
                }
            }

            // Check for 3 outs (Inning Transition)
            if (gameCopy.outs >= 3) {
                gameCopy.outs = 0;
                gameCopy.bases = { first: false, second: false, third: false };

                if (gameCopy.isTopInning) {
                    // Middle of the inning, switch to Bottom
                    gameCopy.isTopInning = false;
                    // Ensure the home team has an initialized score slot for this inning
                    if (gameCopy.lineScore.home.length < gameCopy.inning) {
                        gameCopy.lineScore.home.push(0);
                    }
                } else {
                    // Bottom of inning ends, increment inning
                    gameCopy.inning += 1;
                    gameCopy.isTopInning = true;
                    // Initialize next inning away slot
                    gameCopy.lineScore.away.push(0);
                }
            }

            return { ...state, currentGame: gameCopy };

        case ACTIONS.UNDO_PLAY:
            if (!state.currentGame || state.currentGame.events.length === 0) return state;
            const lastEvent = state.currentGame.events[state.currentGame.events.length - 1];
            return {
                ...state,
                currentGame: lastEvent.stateBefore
            };

        case ACTIONS.FINISH_GAME:
            if (!state.currentGame) return state;
            const finishedGame = { ...state.currentGame, status: 'FINISHED' };
            return {
                ...state,
                currentGame: null,
                pastGames: [...state.pastGames, finishedGame],
            };

        default:
            return state;
    }
}

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('statsdonkey_state');
            if (savedState) {
                dispatch({ type: ACTIONS.LOAD_STATE, payload: JSON.parse(savedState) });
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
        }
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem('statsdonkey_state', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }, [state]);

    // Helper to calculate in-game stats for a specific batter
    const getBatterGameStats = (batterName) => {
        if (!state.currentGame || !state.currentGame.events || !batterName) {
            return { ab: 0, hits: 0, log: [] };
        }

        let ab = 0;
        let hits = 0;
        const log = [];

        state.currentGame.events.forEach(event => {
            const play = event.playInfo;
            // The RunnerModal payload saves ‘currentBatterName’ but if bypass happened it might not be there.
            // If we didn't track it on old plays, we can’t map them, but moving forward we do.
            if (play && play.currentBatterName === batterName) {
                // Determine if it was an official At Bat (Walks and Sacs usually don't count, but in simple slo-pitch we might just count plate appearances. Let's count standard ABs).
                if (play.hitType !== 'WALK') {
                    ab++;
                }

                if (['1B', '2B', '3B', 'HR'].includes(play.hitType)) {
                    hits++;
                    log.push(play.hitType);
                } else if (play.hitType === 'ROE') {
                    log.push('ROE');
                } else if (play.isOutTrigger || play.outsRecorded > 0) {
                    log.push('Out');
                } else if (play.hitType === 'WALK') {
                    log.push('BB');
                }
            }
        });

        return { ab, hits, log };
    };

    const value = {
        state,
        dispatch,

        // Data helpers
        getBatterGameStats,

        // State actions
        setMyTeam: (team) => dispatch({ type: ACTIONS.SET_MY_TEAM, payload: team }),
        addOpponent: (team) => dispatch({ type: ACTIONS.ADD_OPPONENT, payload: team }),
        startNewGame: (config) => dispatch({ type: ACTIONS.START_NEW_GAME, payload: config }),
        updateLineups: (away, home) => dispatch({ type: ACTIONS.UPDATE_LINEUPS, payload: { away, home } }),
        recordPlay: (play) => dispatch({ type: ACTIONS.RECORD_PLAY, payload: play }),
        undoPlay: () => dispatch({ type: ACTIONS.UNDO_PLAY }),
        finishGame: () => dispatch({ type: ACTIONS.FINISH_GAME }),
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
