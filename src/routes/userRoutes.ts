import * as db from '../database'
import express from 'express';

const userRouter = express.Router({ strict: true });

userRouter.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = await db.getUser(userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

userRouter.post('/create', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).send('Name is required');
        return;
    }
    const user = await db.createUpdateUser(name);
    res.json(user);
})

userRouter.post('/update/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = await db.getUser(userId);
    if (user) {
        const { name } = req.body;
        if (!name) {
            res.status(400).send('Name is required');
            return;
        }
        user.name = name;
        await db.AppDataSource.manager.save(user);
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

export default userRouter;