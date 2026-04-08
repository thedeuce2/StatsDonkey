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
app.use(express.json({ limit: '10mb' }));

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// --- Teams ---

app.get('/api/teams', async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: { players: true }
        });
        res.json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

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
        if (error.code === 'P2002') {
            const existingTeam = await prisma.team.findUnique({ where: { name } });
            return res.status(200).json(existingTeam);
        }
        res.status(500).json({ error: 'Failed to create team' });
    }
});

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
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// --- Players ---

app.post('/api/teams/:id/players', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, number } = req.body;
        if (!name) return res.status(400).json({ error: 'Player name is required' });
        
        let player = await prisma.player.findFirst({ where: { name, number: String(number) } });
        if (!player) {
            player = await prisma.player.create({ data: { name, number: String(number) } });
        }

        await prisma.team.update({
            where: { id },
            data: { players: { connect: { id: player.id } } }
        });
        res.status(201).json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add player' });
    }
});

app.delete('/api/teams/:teamId/players/:playerId', async (req, res) => {
    try {
        const { teamId, playerId } = req.params;
        await prisma.team.update({
            where: { id: teamId },
            data: { players: { disconnect: { id: playerId } } }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove player' });
    }
});

// --- Games ---

app.get('/api/games', async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            include: {
                homeTeam: true,
                awayTeam: true,
                atBats: { include: { player: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch games' });
    }
});

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
                runners: '{"first":false,"second":false,"third":false}'
            }
        });
        res.status(201).json(newGame);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create game' });
    }
});

app.put('/api/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        // Clean up data for Prisma
        if (data.runners) data.runners = JSON.stringify(data.runners);
        if (data.lineScore) data.lineScore = JSON.stringify(data.lineScore);
        if (data.lineupHome !== undefined) data.lineupHome = typeof data.lineupHome === 'string' ? data.lineupHome : JSON.stringify(data.lineupHome);
        if (data.lineupAway !== undefined) data.lineupAway = typeof data.lineupAway === 'string' ? data.lineupAway : JSON.stringify(data.lineupAway);
        
        const updatedGame = await prisma.game.update({
            where: { id },
            data: {
                status: data.status,
                currentInning: data.currentInning,
                isTopInning: data.isTopInning,
                outs: data.outs,
                runners: data.runners,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
                currentBatterIdxHome: data.currentBatterIdxHome,
                currentBatterIdxAway: data.currentBatterIdxAway,
                lineScore: data.lineScore,
                ...(data.lineupHome !== undefined && { lineupHome: data.lineupHome }),
                ...(data.lineupAway !== undefined && { lineupAway: data.lineupAway })
            }
        });
        res.json(updatedGame);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update game' });
    }
});

// --- At-Bats ---

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

// SPA Catch-all
app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

app.listen(port, () => {
    console.log(`📡 API Server running on port ${port}`);
});
