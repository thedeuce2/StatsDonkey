import React, { createContext, useReducer, useEffect, useContext, useState } from 'react';

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
    currentBatterIndex: { myTeam: 0, opponent: 0 },
    bases: { first: false, second: false, third: false },
    myLineup: [],
    opponentLineup: [],
    myBench: [],
    opponentBench: [],
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
    UPDATE_TEAM: 'UPDATE_TEAM',
    SUBSTITUTE_PLAYER: 'SUBSTITUTE_PLAYER',
    ASSIGN_COURTESY_RUNNER: 'ASSIGN_COURTESY_RUNNER',
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
            updatedGame.opponentBench = action.payload.awayBench || [];
            updatedGame.myBench = action.payload.homeBench || [];
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

            // Ensure backward compatibility of currentBatterIndex
            if (!gameCopy.currentBatterIndex) {
                gameCopy.currentBatterIndex = { myTeam: 0, opponent: 0 };
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

        case ACTIONS.UPDATE_TEAM:
            const isUserTeam = action.payload.isUserTeam;
            if (isUserTeam) {
                return { ...state, myTeam: action.payload };
            } else {
                const newOpponents = state.opponents.map(opp => 
                    opp.id === action.payload.id ? action.payload : opp
                );
                return { ...state, opponents: newOpponents };
            }

        case ACTIONS.SUBSTITUTE_PLAYER: {
            if (!state.currentGame) return state;
            const { team, oldPlayerName, newPlayerName, isCourtesy } = action.payload;
            const gameCopy = JSON.parse(JSON.stringify(state.currentGame));
            
            const stateBeforeClone = JSON.parse(JSON.stringify(state.currentGame));
            stateBeforeClone.events = [];
            
            gameCopy.events.push({
                playInfo: { 
                    isSub: true, 
                    oldPlayerName, 
                    newPlayerName, 
                    team, 
                    subType: isCourtesy ? 'Courtesy Runner' : 'Substitution' 
                },
                stateBefore: stateBeforeClone
            });

            const lineupKey = team === 'away' ? 'opponentLineup' : 'myLineup';
            const benchKey = team === 'away' ? 'opponentBench' : 'myBench';

            // 1. Swap in Lineup
            gameCopy[lineupKey] = gameCopy[lineupKey].map(p => {
                const pName = p.name || (typeof p === 'string' ? p : null);
                if (pName === oldPlayerName) return { ...p, name: newPlayerName };
                return p;
            });

            // 2. Swap in Bench
            gameCopy[benchKey] = gameCopy[benchKey].map(p => {
                const pName = p.name || (typeof p === 'string' ? p : null);
                if (pName === newPlayerName) return { ...p, name: oldPlayerName };
                return p;
            });

            // 3. Update Bases if it was a courtesy runner swap
            if (isCourtesy) {
                Object.keys(gameCopy.bases).forEach(base => {
                    if (gameCopy.bases[base] === oldPlayerName) {
                        gameCopy.bases[base] = newPlayerName;
                    }
                });
            }

            return { ...state, currentGame: gameCopy };
        }

        case ACTIONS.ASSIGN_COURTESY_RUNNER: {
            if (!state.currentGame) return state;
            const { base, newRunnerName } = action.payload;
            const gameCopy = JSON.parse(JSON.stringify(state.currentGame));
            const oldRunnerName = gameCopy.bases[base];

            const stateBeforeClone = JSON.parse(JSON.stringify(state.currentGame));
            stateBeforeClone.events = [];

            gameCopy.events.push({
                playInfo: { isSub: true, oldPlayerName: oldRunnerName, newPlayerName: newRunnerName, subType: 'Courtesy Runner' },
                stateBefore: stateBeforeClone
            });

            gameCopy.bases[base] = newRunnerName;
            return { ...state, currentGame: gameCopy };
        }

        default:
            return state;
    }
}

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from database on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Fetch Teams
                const teamsRes = await fetch('/api/teams');
                let apiMyTeam = null;
                let apiOpponents = [];

                if (teamsRes.ok) {
                    const teams = await teamsRes.json();
                    apiMyTeam = teams.find(t => t.isUserTeam) || null;
                    apiOpponents = teams.filter(t => !t.isUserTeam);
                }

                // 2. Fetch Games
                const gamesRes = await fetch('/api/games');
                let pastGames = [];
                let currentGame = null;

                if (gamesRes.ok) {
                    const games = await gamesRes.json();
                    // Status 'in_progress' means it's the current game
                    currentGame = games.find(g => g.status === 'in_progress') || null;
                    pastGames = games.filter(g => g.status !== 'in_progress');
                    
                    // Map database fields to frontend state properties
                    if (currentGame) {
                        currentGame.lineupHome = JSON.parse(currentGame.lineupHome || '[]');
                        currentGame.lineupAway = JSON.parse(currentGame.lineupAway || '[]');
                        currentGame.bases = JSON.parse(currentGame.runners || '{"first":false,"second":false,"third":false}');
                        currentGame.score = {
                            away: currentGame.awayScore || 0,
                            home: currentGame.homeScore || 0
                        };
                        currentGame.lineScore = JSON.parse(currentGame.lineScore || '{"away":[0],"home":[0]}');
                        currentGame.currentBatterIndex = {
                            myTeam: currentGame.currentBatterIdxHome || 0,
                            opponent: currentGame.currentBatterIdxAway || 0
                        };
                        // Map internal naming
                        currentGame.myLineup = currentGame.lineupHome;
                        currentGame.opponentLineup = currentGame.lineupAway;
                        
                        // Note: Events are currently not persisted directly as a blob,
                        // so we start with an empty log unless we fetch AtBats separately.
                        currentGame.events = [];
                    }
                }

                // 3. Fallback to localStorage for anything missing (backwards compatibility)
                let localState = {};
                try {
                    const savedStateStr = localStorage.getItem('statsdonkey_state');
                    if (savedStateStr) {
                        localState = JSON.parse(savedStateStr);
                    }
                } catch (e) { }

                const finalState = {
                    myTeam: apiMyTeam || localState.myTeam || null,
                    opponents: apiOpponents.length > 0 ? apiOpponents : (localState.opponents || []),
                    currentGame: currentGame || localState.currentGame || null,
                    pastGames: pastGames.length > 0 ? pastGames : (localState.pastGames || []),
                };

                dispatch({
                    type: ACTIONS.LOAD_STATE,
                    payload: finalState
                });
                setIsInitialized(true);
            } catch (e) {
                console.error("Failed to load initial data", e);
                setIsInitialized(true);
            }
        };

        fetchInitialData();
    }, []);

    // Save to local storage whenever state changes
    useEffect(() => {
        if (!isInitialized) return; // Prevent wiping storage with initialState on mount

        try {
            localStorage.setItem('statsdonkey_state', JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }, [state, isInitialized]);

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
        
        startNewGame: async (config) => {
            try {
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        homeTeamId: config.myTeamId,
                        awayTeamId: config.opponentTeamId,
                        lineupHome: config.myLineup,
                        lineupAway: config.opponentLineup
                    })
                });
                if (response.ok) {
                    const game = await response.json();
                    dispatch({ type: ACTIONS.START_NEW_GAME, payload: { ...config, id: game.id } });
                }
            } catch (e) {
                console.error("Failed to start game on server", e);
                dispatch({ type: ACTIONS.START_NEW_GAME, payload: config });
            }
        },

        updateLineups: (away, home, awayBench, homeBench) => 
            dispatch({ type: ACTIONS.UPDATE_LINEUPS, payload: { away, home, awayBench, homeBench } }),

        recordPlay: async (play) => {
            // 1. Dispatch locally for instant UI update
            dispatch({ type: ACTIONS.RECORD_PLAY, payload: play });

            // 2. Sync to server in background
            if (state.currentGame?.id) {
                try {
                    // Update main game state
                    await fetch(`/api/games/${state.currentGame.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'in_progress',
                            currentInning: state.currentGame.inning,
                            isTopInning: state.currentGame.isTopInning,
                            outs: state.currentGame.outs,
                            homeScore: state.currentGame.score.home,
                            awayScore: state.currentGame.score.away,
                            runners: state.currentGame.bases,
                            currentBatterIdxHome: state.currentGame.currentBatterIndex.myTeam,
                            currentBatterIdxAway: state.currentGame.currentBatterIndex.opponent,
                            lineScore: state.currentGame.lineScore
                        })
                    });

                    // Record At-Bat if it's a plate appearance
                    if (play.hitType || play.isOutTrigger) {
                        await fetch(`/api/games/${state.currentGame.id}/atbats`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                playerId: play.playerId || play.currentBatterName, // Need proper ID mapping later
                                inning: state.currentGame.inning,
                                isTopInning: state.currentGame.isTopInning,
                                result: play.hitType || 'OUT',
                                hitType: play.hitType,
                                hitLocationX: play.location?.x,
                                hitLocationY: play.location?.y,
                                runsScored: play.runsScored
                            })
                        });
                    }
                } catch (e) {
                    console.error("Failed to sync play to server", e);
                }
            }
        },

        undoPlay: () => dispatch({ type: ACTIONS.UNDO_PLAY }),

        finishGame: async () => {
            if (state.currentGame?.id) {
                await fetch(`/api/games/${state.currentGame.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'completed' })
                });
            }
            dispatch({ type: ACTIONS.FINISH_GAME });
        },

        updateTeam: (team) => dispatch({ type: ACTIONS.UPDATE_TEAM, payload: team }),
        
        substitutePlayer: (team, oldPlayerName, newPlayerName, isCourtesy = false) => 
            dispatch({ type: ACTIONS.SUBSTITUTE_PLAYER, payload: { team, oldPlayerName, newPlayerName, isCourtesy } }),
            
        assignCourtesyRunner: (base, newRunnerName) => 
            dispatch({ type: ACTIONS.ASSIGN_COURTESY_RUNNER, payload: { base, newRunnerName } }),
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
