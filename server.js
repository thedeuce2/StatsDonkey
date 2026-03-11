import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for logo Base64 strings

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
        res.status(500).json({ error: 'Failed to fetch teams' });
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
            return res.status(400).json({ error: 'A team with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create team' });
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
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'A team with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// --- Players ---

// Add a player to a team
app.post('/api/teams/:id/players', async (req, res) => {
    try {
        const { id } = req.params; // Team ID
        const { name, number } = req.body;

        // Try to find if player already exists by name/number
        let player = null;
        if (number) {
            player = await prisma.player.findFirst({
                where: { name, number }
            });
        }

        // If not found, create new player
        if (!player) {
            player = await prisma.player.create({
                data: { name, number }
            });
        }

        // Connect player to team
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
        res.status(500).json({ error: 'Failed to add player to team' });
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

app.listen(port, () => {
    console.log(`📡 API Server running on port ${port}`);
});
