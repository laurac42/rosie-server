import express from "express";
import fetch from "node-fetch";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

// API to send a notification on demand
app.post("/send-notification", async (req, res) => {
    const { token, title, body } = req.body;

    if (!token) {
        return res.status(400).json({ error: "FCM token is required!" });
    }

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `key=${FCM_SERVER_KEY}`,
        },
        body: JSON.stringify({
            to: token,
            notification: { title, body },
        }),
    });

    const data = await response.json();
    res.json(data);
});

// 🔹 Schedule a daily notification at 9 AM UTC
cron.schedule("0 9 * * *", async () => {
    console.log("Sending daily notification...");

    const userTokens = [process.env.TEST_FCM_TOKEN]; // Store real user tokens in a database

    for (let token of userTokens) {
        await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${FCM_SERVER_KEY}`,
            },
            body: JSON.stringify({
                to: token,
                notification: {
                    title: "Daily Reminder",
                    body: "Don't forget your tasks for today!",
                },
            }),
        });
    }

    console.log("Daily notifications sent.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});