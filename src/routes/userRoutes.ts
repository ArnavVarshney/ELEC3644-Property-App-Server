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

export default userRouter;