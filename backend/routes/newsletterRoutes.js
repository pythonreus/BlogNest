const express = require('express');
const router = express.Router();
const Newsletter = require('../models/newsletterModel');

// Add a new email to the newsletter
router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        const newSubscriber = await Newsletter.create({ email });
        res.status(201).json({ message: 'Subscribed successfully', subscriber: newSubscriber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
