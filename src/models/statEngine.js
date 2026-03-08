import { EVENT_TYPES } from './types';

// Helper to determine if an event counts as an at-bat (AB)
export const isAtBat = (eventType) => {
    return [
        EVENT_TYPES.OUT,
        EVENT_TYPES.STRIKEOUT,
        EVENT_TYPES.SINGLE,
        EVENT_TYPES.DOUBLE,
        EVENT_TYPES.TRIPLE,
        EVENT_TYPES.HOME_RUN,
        EVENT_TYPES.ERROR_REACHED,
        EVENT_TYPES.FIELDER_CHOICE
    ].includes(eventType);
};

// Helper to determine if an event is a hit (H)
export const isHit = (eventType) => {
    return [
        EVENT_TYPES.SINGLE,
        EVENT_TYPES.DOUBLE,
        EVENT_TYPES.TRIPLE,
        EVENT_TYPES.HOME_RUN
    ].includes(eventType);
};

// Calculate total bases from an event
export const getBasesForEvent = (eventType) => {
    switch (eventType) {
        case EVENT_TYPES.SINGLE: return 1;
        case EVENT_TYPES.DOUBLE: return 2;
        case EVENT_TYPES.TRIPLE: return 3;
        case EVENT_TYPES.HOME_RUN: return 4;
        default: return 0;
    }
};

/**
 * Given an array of GameEvents for a specific player, calculates standard stats.
 */
export const calculatePlayerStats = (events) => {
    let pa = 0; // Plate Appearances
    let ab = 0; // At Bats
    let hits = 0;
    let singles = 0;
    let doubles = 0;
    let triples = 0;
    let homeRuns = 0;
    let walks = 0;
    let rbi = 0;
    let runs = 0;

    events.forEach(event => {
        pa++;

        if (isAtBat(event.eventType)) ab++;
        if (isHit(event.eventType)) hits++;

        if (event.eventType === EVENT_TYPES.SINGLE) singles++;
        else if (event.eventType === EVENT_TYPES.DOUBLE) doubles++;
        else if (event.eventType === EVENT_TYPES.TRIPLE) triples++;
        else if (event.eventType === EVENT_TYPES.HOME_RUN) homeRuns++;
        else if (event.eventType === EVENT_TYPES.WALK) walks++;

        rbi += (event.rbi || 0);
        runs += (event.runsScored || 0); // Note: runs usually tracked differently, but simplification for now
    });

    const average = ab > 0 ? (hits / ab) : 0;
    const obp = pa > 0 ? ((hits + walks) / pa) : 0;

    const totalBases = singles + (doubles * 2) + (triples * 3) + (homeRuns * 4);
    const slugging = ab > 0 ? (totalBases / ab) : 0;

    const ops = obp + slugging;

    return {
        pa, ab, hits, singles, doubles, triples, homeRuns, walks, rbi, runs,
        average: average.toFixed(3),
        obp: obp.toFixed(3),
        slugging: slugging.toFixed(3),
        ops: ops.toFixed(3)
    };
};
