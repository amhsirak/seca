const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/v1/status', (req, res) => {
    res.status(200).send({ status: 'OK' });
});

// /users/{userId} endpoint (PII/Secret/IDOR Potential)
app.get('/v1/users/:userId', (req, res) => {
    const userId = req.params.userId;
    res.status(200).json({
        id: userId,
        username: `user_${userId}`,
        email: `test${userId}@example.com`,
        password_hash: "AKIAJZZZZZZZZZZZZZZZ",
        address: "123 Main St, USA",
    });
});

// /login endpoint (Rate Limit Vulnerable - no rate limiting applied here)
app.post('/v1/login', (req, res) => {
    // In a real app, you'd check credentials. Here, it always succeeds quickly.
    res.status(200).send({ message: "Login success (but not rate limited!)" });
});

app.listen(port, () => {
    console.log(`Mock API listening at http://localhost:${port}`);
});