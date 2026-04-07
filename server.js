import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for logo Base64 strings

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Teams ---

// Get all teams and their players
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: { players: true }
        });
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams', details: error.message, code: error.code });
    }
});

// Create a new team
app.post('/api/teams', async (req, res) => {
    try {
        const { name, color, isUserTeam, logo } = req.body;
        const newTeam = await prisma.team.create({
            data: {
                name,
                color,
                logo,
                isUserTeam: isUserTeam || false,
            },
            include: { players: true }
        });
        res.status(201).json(newTeam);
    } catch (error) {
        console.error('Error creating team:', error);
        
        // Prisma P2002 means unique constraint failed (name exists)
        if (error.code === 'P2002') {
            try {
                // If it exists, just return the existing one so the frontend can recover
                const existingTeam = await prisma.team.findUnique({
                    where: { name }
                });
                return res.status(200).json(existingTeam);
            } catch (findErr) {
                return res.status(500).json({ error: 'Failed to recover existing team', details: findErr.message });
            }
        }
        res.status(500).json({ error: 'Failed to create team', details: error.message });
    }
});

// Update an existing team
app.put('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, logo } = req.body;
        
        const updatedTeam = await prisma.team.update({
            where: { id },
            data: { name, color, logo },
            include: { players: true }
        });
        
        res.json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A team with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to update team', details: error.message });
    }
});

// --- Players ---

// Add a player to a team
app.post('/api/teams/:id/players', async (req, res) => {
    try {
        const { id } = req.params; // Team ID
        let { name, number } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ error: 'Player name is required and cannot be empty.' });
        }
        
        name = name.trim();
        number = number ? String(number).trim() : '';

        let player = await prisma.player.findFirst({
            where: { name, number }
        });

        if (!player) {
            player = await prisma.player.create({
                data: { name, number }
            });
        }

        const updatedTeam = await prisma.team.update({
            where: { id },
            data: {
                players: {
                    connect: { id: player.id }
                }
            },
            include: { players: true }
        });

        res.status(201).json(player);
    } catch (error) {
        console.error('Error adding player:', error);
        res.status(500).json({ error: 'Failed to add player to team', details: error.message });
    }
});

// Remove a player from a team
app.delete('/api/teams/:teamId/players/:playerId', async (req, res) => {
    try {
        const { teamId, playerId } = req.params;
        await prisma.team.update({
            where: { id: teamId },
            data: {
                players: {
                    disconnect: { id: playerId }
                }
            }
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error removing player:', error);
        res.status(500).json({ error: 'Failed to remove player from team' });
    }
});

// --- Games ---

// Get all games
app.get('/api/games', async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            include: {
                homeTeam: true,
                awayTeam: true,
                atBats: {
                    include: { player: true }
                }
            },
            orderBy: { date: 'desc' }
        });
        res.json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

// Create a new game
app.post('/api/games', async (req, res) => {
    try {
        const { homeTeamId, awayTeamId, lineupHome, lineupAway } = req.body;
        const newGame = await prisma.game.create({
            data: {
                homeTeamId,
                awayTeamId,
                lineupHome: JSON.stringify(lineupHome || []),
                lineupAway: JSON.stringify(lineupAway || []),
                status: 'in_progress',
                currentInning: 1,
                isTopInning: true,
                outs: 0,
                runners: JSON.stringify([])
            }
        });
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game', details: error.message });
    }
});

// Update game state
app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, currentInning, isTopInning, outs, 
            runners, homeScore, awayScore,
            currentBatterIdxHome, currentBatterIdxAway
        } = req.body;

        const updatedGame = await prisma.game.update({
            where: { id },
            data: {
                status,
                currentInning,
                isTopInning,
                outs,
                runners: runners ? JSON.stringify(runners) : undefined,
                homeScore,
                awayScore,
                currentBatterIdxHome,
                currentBatterIdxAway
            }
        });
        res.json(updatedGame);
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
});

// --- At-Bats ---

// Record an at-bat
app.post('/api/games/:gameId/atbats', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { 
            playerId, inning, isTopInning, result, 
            hitType, hitVelocity, hitLocationX, hitLocationY,
            advancements, rbi, runsScored 
        } = req.body;

        const atBat = await prisma.atBat.create({
            data: {
                gameId,
                playerId,
                inning,
                isTopInning,
                result,
                hitType,
                hitVelocity,
                hitLocationX,
                hitLocationY,
                advancements: JSON.stringify(advancements || []),
                rbi: rbi || 0,
                runsScored: runsScored || 0
            }
        });
        res.status(201).json(atBat);
    } catch (error) {
        console.error('Error recording at-bat:', error);
        res.status(500).json({ error: 'Failed to record at-bat' });
    }
});

// --- Static Files ---
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Catch-all: Send all non-API requests to index.html
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`📡 API Server running on port ${PORT}`);
});
