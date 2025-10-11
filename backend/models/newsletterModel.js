const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
}, {
    timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Newsletter', newsletterSchema);
