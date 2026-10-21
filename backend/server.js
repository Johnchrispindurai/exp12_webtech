
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

let articles;
let isConnected = false;

// Check backend status
app.get('/', (req, res) => {
    res.send('DAILYPOST News Portal Backend is running!');
});

// Get all news articles
app.get('/api/news', async (req, res) => {
    try {
        const records = await articles
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch news' });
    }
});

// Publish a news article
app.post('/api/news', async (req, res) => {
    try {
        const { title, category, author, content, image } = req.body;

        if (
            typeof title !== 'string' || !title.trim() ||
            typeof category !== 'string' || !category.trim() ||
            typeof author !== 'string' || !author.trim() ||
            typeof content !== 'string' || !content.trim()
        ) {
            return res.status(400).json({
                error: 'Title, category, author and content are required'
            });
        }

        const article = {
            title: title.trim(),
            category: category.trim(),
            author: author.trim(),
            content: content.trim(),
            image: typeof image === 'string' ? image.trim() : '',
            createdAt: new Date()
        };

        const result = await articles.insertOne(article);

        res.status(201).json({
            message: 'News published successfully',
            article: { _id: result.insertedId, ...article }
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to publish news' });
    }
});

// Update a news article
app.put('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, author, content, image } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }

        if (
            typeof title !== 'string' || !title.trim() ||
            typeof category !== 'string' || !category.trim() ||
            typeof author !== 'string' || !author.trim() ||
            typeof content !== 'string' || !content.trim()
        ) {
            return res.status(400).json({
                error: 'Title, category, author and content are required'
            });
        }

        const result = await articles.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: title.trim(),
                    category: category.trim(),
                    author: author.trim(),
                    content: content.trim(),
                    image: typeof image === 'string' ? image.trim() : ''
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'News updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update news' });
    }
});

// Delete a news article
app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }

        const result = await articles.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete news' });
    }
});

// Connect to MongoDB Atlas and start server
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing from environment variables');
        }

        await client.connect();

        const db = client.db('DailyPostDB');
        articles = db.collection('Articles');
        isConnected = true;

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`DAILYPOST backend running on port ${PORT}`);
            console.log('Connected to MongoDB Atlas');
        });
    } catch (error) {
        console.error('Startup failed:', error.message);
        process.exit(1);
    }
}

startServer();
