require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/quran_app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.send('Ajr API Running');
});

// ─── Surahs ───────────────────────────────────────────
app.get('/api/surahs', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.quran.com/api/v4/chapters');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching surahs:', error);
        res.status(500).json({ message: 'Error fetching surahs' });
    }
});

// ─── Reciters ─────────────────────────────────────────
app.get('/api/reciters', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.quran.com/api/v4/resources/recitations');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching reciters:', error);
        res.status(500).json({ message: 'Error fetching reciters' });
    }
});

// Helper to remove tashkeel and normalize text for search
function normalizeText(text) {
    if (!text) return '';

    // Normalize Alif variants (ٱ, آ, أ, إ -> ا)
    let normalized = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
    normalized = normalized.replace(/[إأآٱ]/g, 'ا');

    // Normalize Taa Marbuta (ة -> ه) - Common in search
    normalized = normalized.replace(/ة/g, 'ه');

    // Normalize Yaa / Alif Maqsura (ى -> ي)
    normalized = normalized.replace(/ى/g, 'ي');

    return normalized;
}

// ─── Search ───────────────────────────────────────────
const quranData = require('./data/quran.json');

// ─── Search ───────────────────────────────────────────
app.get('/api/search', (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ code: 200, data: { matches: [] } });

        const normalizedQuery = normalizeText(q);

        const matches = [];
        const LIMIT = 50;

        // Limit results to prevent huge payload


        for (const surah of quranData) {
            for (const verse of surah.verses) {
                const normalizedText = normalizeText(verse.text);

                // Check for exact word match or substring? 
                // Substring is safer for general search.
                if (normalizedText.includes(normalizedQuery)) {
                    matches.push({
                        number: verse.id,
                        text: verse.text,
                        surah: {
                            number: surah.id,
                            name: surah.name,
                            englishName: surah.transliteration,
                            revelationType: surah.type
                        },
                        numberInSurah: verse.id
                    });
                    if (matches.length >= LIMIT) break;
                }
            }
            if (matches.length >= LIMIT) break;
        }


        res.json({
            code: 200,
            status: "OK",
            data: {
                count: matches.length,
                matches: matches
            }
        });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Error searching' });
    }
});

// ─── Bookmarks ────────────────────────────────────────
const BookmarkSchema = new mongoose.Schema({
    surahNumber: Number,
    ayahNumber: Number,
    note: String,
    date: { type: Date, default: Date.now }
});
const Bookmark = mongoose.model('Bookmark', BookmarkSchema);

app.post('/api/bookmarks', async (req, res) => {
    try {
        const { surahNumber, ayahNumber, note } = req.body;
        const newBookmark = new Bookmark({ surahNumber, ayahNumber, note });
        await newBookmark.save();
        res.status(201).json(newBookmark);
    } catch (error) {
        res.status(500).json({ message: 'Error saving bookmark' });
    }
});

app.get('/api/bookmarks', async (req, res) => {
    try {
        const bookmarks = await Bookmark.find().sort({ date: -1 });
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookmarks' });
    }
});

// ─── Blog Posts ───────────────────────────────────────
const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    date: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const newPost = new Post({ title, content, author });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post' });
    }
});

// ─── Dorar.net API Proxy ─────────────────────────────────────────────────────

// Helper to remove tashkeel (diacritics)
function removeTashkeel(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
}

app.get('/api/hadith/sharh', async (req, res) => {
    try {
        const { text } = req.query;
        if (!text) return res.status(400).json({ error: 'text required' });

        // Clean text for better search
        const cleanText = text.slice(0, 100).replace(/[^\u0600-\u06FF\s]/g, ' ').trim();

        const fetch = (await import('node-fetch')).default;
        const encoded = encodeURIComponent(cleanText);
        // Using skey as requested by user
        const url = `https://dorar.net/dorar_api.json?skey=${encoded}`;

        console.log(`[Dorar] Searching for: "${cleanText}"`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const textRes = await response.text();

        // Dorar sometimes returns JSONP if callback is in url, but we didn't add it.
        // It returns JSON.
        let data;
        try {
            data = JSON.parse(textRes);
        } catch (e) {
            console.error('[Dorar] Invalid JSON response:', textRes.slice(0, 100));
            return res.json({ found: false });
        }

        const htmlResult = data.ahadith?.result;

        if (!htmlResult || htmlResult.includes('لا يوجد نتائج')) {
            return res.json({ found: false });
        }

        res.json({
            found: true,
            html: htmlResult
        });

    } catch (error) {
        console.error('Dorar proxy error:', error.message);
        res.json({ found: false });
    }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

