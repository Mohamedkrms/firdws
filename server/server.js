require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { JSDOM } = require("jsdom");
const ImageKit = require("imagekit");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/quran_app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const fs = require('fs');
const path = require('path');

// Routes
app.get('/', (req, res) => {
    res.send('Ajr API Running');
});

const BASE_URL = 'https://firdws.com';

// ─── Dynamic Sitemap Generation ────────────────────────
app.get('/sitemap.xml', async (req, res) => {
    try {
        res.header('Content-Type', 'application/xml');
        let urls = [];

        const addUrl = (loc, priority = 0.5, changefreq = 'weekly') => {
            urls.push(`
                <url>
                    <loc>${BASE_URL}${loc}</loc>
                    <changefreq>${changefreq}</changefreq>
                    <priority>${priority}</priority>
                </url>
            `);
        };

        // Static Core Routes
        addUrl('', 1.0, 'monthly');
        addUrl('/quran', 0.9, 'yearly');
        addUrl('/listen', 0.8, 'yearly');
        addUrl('/sunnah', 0.8, 'yearly');
        addUrl('/books', 0.7, 'yearly');
        addUrl('/live', 0.7, 'yearly');
        addUrl('/blog', 0.7, 'yearly');
        addUrl('/forum', 0.7, 'yearly');
        addUrl('/ulama', 0.7, 'yearly');
        addUrl('/about', 0.5, 'yearly');
        addUrl('/contact', 0.5, 'yearly');
        addUrl('/privacy', 0.3, 'yearly');
        addUrl('/terms', 0.3, 'yearly');

        // Dynamic Routes: Surahs and Ayahs
        quranData.forEach(surah => {
            // Surah page
            addUrl(`/surah/${surah.id}`, 0.8, 'yearly');

            // Ayah pages
            surah.verses.forEach(verse => {
                addUrl(`/surah/${surah.id}/${verse.id}`, 0.6, 'yearly');
            });
        });

        // Dynamic Routes: Sunnah Books and Sections
        // Hardcoding standard books for generating structured routes without fetching full dorar tree
        const sunnahBooks = [
            { id: 'bukhari', sections: 97 },
            { id: 'muslim', sections: 56 },
            { id: 'abudawud', sections: 43 },
            { id: 'tirmidhi', sections: 50 },
            { id: 'nasai', sections: 51 },
            { id: 'ibnmajah', sections: 37 }
        ];

        sunnahBooks.forEach(book => {
            addUrl(`/sunnah/${book.id}`, 0.8, 'yearly');
            for (let s = 1; s <= book.sections; s++) {
                addUrl(`/sunnah/${book.id}/${s}`, 0.7, 'yearly');
            }
        });

        // Dynamic Routes: Blog and Forum Posts
        const posts = await Post.find({ isApproved: true }, '_id slug date').lean();
        posts.forEach(post => {
            addUrl(`/blog/${post.slug || post._id}`, 0.7, 'yearly');
        });


        for (let id = 1; id <= 166; id++) {
            addUrl(`/listen/${id}`, 0.7, 'yearly');
            for (let s = 1; s <= 114; s++) {
                addUrl(`/listen/${id}/${s}`, 0.6, 'yearly');
            }
        }
        // Dynamic Routes: Ulama (Scholars) and their content
        const allUlama = await Ulama.find({}, 'slug _id bio audios videos').lean();
        allUlama.forEach(u => {
            const scholarSlug = u.slug || u._id;

            // Scholar main page
            addUrl(`/ulama/${scholarSlug}`, 0.7, 'yearly');

            // Audio category and individual items
            if (u.audios && u.audios.length > 0) {
                addUrl(`/ulama/${scholarSlug}/audios`, 0.6, 'yearly');
                u.audios.forEach(audio => {
                    addUrl(`/ulama/${scholarSlug}/audios/${audio.id}`, 0.6, 'yearly');
                });
            }

            // Video category and individual items
            if (u.videos && u.videos.length > 0) {
                addUrl(`/ulama/${scholarSlug}/videos`, 0.6, 'yearly');
                u.videos.forEach(video => {
                    addUrl(`/ulama/${scholarSlug}/videos/${video.id}`, 0.6, 'yearly');
                });
            }

            // Bio page
            if (u.bio) {
                addUrl(`/ulama/${scholarSlug}/bio`, 0.5, 'yearly');
            }
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join('')}
</urlset>`;

        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap Error:', error);
        res.status(500).end();
    }
});

// ─── ImageKit Auth ────────────────────────────────────
app.get('/api/imagekit/auth', (req, res) => {
    try {
        const result = imagekit.getAuthenticationParameters();
        res.send(result);
    } catch (error) {
        console.error('ImageKit Auth Error:', error);
        res.status(500).json({ message: 'Error generating auth parameters' });
    }
});

// ─── File Upload for Ulama (Audio/Video/Images) ────────────────────────────
app.post('/api/ulama/upload', (req, res) => {
    try {
        const { file, fileName, folder, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!file || !fileName) {
            return res.status(400).json({ message: 'File and fileName required' });
        }

        // Extract MIME type from file
        const mimeMatch = file.match(/data:([^;]+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

        // Convert base64 to buffer
        const base64Data = file.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const folderPath = folder || 'ulama';

        imagekit.upload({
            file: buffer,
            fileName: fileName,
            folder: `/ulama/${folderPath}`,
            tags: ['ulama', folderPath]
        }, (error, result) => {
            if (error) {
                console.error('ImageKit Upload Error:', error);
                return res.status(500).json({ message: 'Error uploading file' });
            }
            res.json({
                success: true,
                url: result.url,
                fileId: result.fileId,
                name: result.name
            });
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
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

// ─── Blog Posts & Forum Q&A ───────────────────────────
const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    authorId: { type: String },
    isBlog: { type: Boolean, default: false },
    imageUrl: { type: String },
    tags: [{ type: String }],
    upvoters: [{ type: String }],
    downvoters: [{ type: String }],
    isApproved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

const ReplySchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    authorId: { type: String },
    date: { type: Date, default: Date.now }
});
const Reply = mongoose.model('Reply', ReplySchema);

app.get('/api/posts', async (req, res) => {
    try {
        const { isBlog, tag, adminEmail } = req.query;
        const query = {};

        if (isBlog !== undefined) {
            query.isBlog = isBlog === 'true';
        }
        if (tag) {
            query.tags = tag;
        }

        // Only admins can see unapproved posts. Everyone else sees only approved posts.
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            query.$or = [
                { isApproved: true },
                { isApproved: { $exists: false } }
            ];
        }

        const posts = await Post.find(query).sort({ date: -1 }).lean();

        // Add reply counts
        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const replyCount = await Reply.countDocuments({ postId: post._id });
            return { ...post, replyCount };
        }));

        res.json(postsWithCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Update Post
app.put('/api/posts/:postId', async (req, res) => {
    try {
        const { title, content, authorEmail, authorId, tags, imageUrl } = req.body;
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (authorEmail !== process.env.ADMIN_EMAIL && post.authorId !== authorId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.title = title || post.title;
        post.content = content || post.content;
        if (imageUrl !== undefined) post.imageUrl = imageUrl;
        if (tags !== undefined) post.tags = tags;

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Approve Post
app.put('/api/posts/:postId/approve', async (req, res) => {
    try {
        const { adminEmail } = req.body;
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized: Only admin can approve posts' });
        }

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.isApproved = true;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error approving post' });
    }
});

// Delete Post
app.delete('/api/posts/:postId', async (req, res) => {
    try {
        const { adminEmail, authorId } = req.query;
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isAdmin = adminEmail && adminEmail === process.env.ADMIN_EMAIL;
        const isAuthor = authorId && post.authorId === authorId;

        if (!isAdmin && !isAuthor) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(req.params.postId);
        await Reply.deleteMany({ postId: req.params.postId });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author, authorId, isBlog, authorEmail, imageUrl, tags } = req.body;

        if (isBlog && authorEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized: Only admin can create blog posts' });
        }

        // Generate Slug
        let baseSlug = title.trim().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A\u0660-\u0669\-]/g, '');
        if (!baseSlug) baseSlug = 'post';
        let slug = baseSlug;
        let counter = 1;
        while (await Post.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Auto-approve if created by Admin
        const isAdmin = authorEmail === process.env.ADMIN_EMAIL;
        const newPost = new Post({
            title,
            slug,
            content,
            author,
            authorId,
            isBlog,
            imageUrl,
            tags: tags || [],
            isApproved: isAdmin
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

app.post('/api/posts/:postId/vote', async (req, res) => {
    try {
        const { userId, vote } = req.body; // vote is '1' (up), '-1' (down), or '0' (neutral)

        if (!userId) return res.status(400).json({ message: 'User ID required' });

        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Remove user from both arrays first to reset
        post.upvoters = post.upvoters.filter(id => id !== userId);
        post.downvoters = post.downvoters.filter(id => id !== userId);

        if (vote == 1) {
            post.upvoters.push(userId);
        } else if (vote == -1) {
            post.downvoters.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ message: 'Error updating vote' });
    }
});

app.get('/api/posts/:postId/replies', async (req, res) => {
    try {
        const replies = await Reply.find({ postId: req.params.postId }).sort({ date: 1 });
        res.json(replies);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching replies' });
    }
});

app.post('/api/posts/:postId/replies', async (req, res) => {
    try {
        const { content, author, authorId } = req.body;
        const newReply = new Reply({
            postId: req.params.postId,
            content,
            author,
            authorId
        });
        await newReply.save();
        res.status(201).json(newReply);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reply' });
    }
});

// ─── Dorar.net API Proxy ─────────────────────────────────────────────────────

// Helper to remove tashkeel (diacritics)
function removeTashkeel(text) {
    return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');
}

// Helper: parse takhrij HTML from Dorar API
function parseTakhrijHTML(htmlResult) {
    const dom = new JSDOM(htmlResult);
    const doc = dom.window.document;
    const hadiths = [];
    const hadithDivs = doc.querySelectorAll('div.hadith');

    hadithDivs.forEach((div) => {
        const text = div.textContent.trim();
        const infoDiv = div.nextElementSibling;
        let rawi = "", muhadith = "", source = "", number = "", grade = "";

        if (infoDiv && infoDiv.className.includes("hadith-info")) {
            const spans = infoDiv.querySelectorAll("span.info-subtitle");
            spans.forEach((span) => {
                const key = span.textContent.replace(":", "").trim();
                // Collect text from all following siblings until next info-subtitle
                let value = '';
                let node = span.nextSibling;
                while (node) {
                    if (node.nodeType === 1 && node.classList?.contains('info-subtitle')) break;
                    value += node.textContent || '';
                    node = node.nextSibling;
                }
                value = value.replace(/[\[\]]/g, '').trim();
                switch (key) {
                    case "الراوي": rawi = value; break;
                    case "المحدث": muhadith = value; break;
                    case "المصدر": source = value; break;
                    case "الصفحة أو الرقم": number = value; break;
                    case "خلاصة حكم المحدث": grade = value; break;
                }
            });
        }
        hadiths.push({ text, rawi, muhadith, source, number, grade });
    });
    // Sort by grade strength: صحيح (strongest) → ضعيف (weakest)
    hadiths.sort((a, b) => gradeRank(a.grade) - gradeRank(b.grade));
    return hadiths;
}

// Rank hadith grade: lower = stronger (check specific grades BEFORE generic)
function gradeRank(grade) {
    if (!grade) return 99;
    const g = grade.trim();
    if (g.includes('متواتر')) return 0;           // Mutawatir (highest)
    if (g.includes('موضوع')) return 10;           // Fabricated (lowest)
    if (g.includes('لا أصل له')) return 9;        // No basis
    if (g.includes('منكر')) return 8;             // Rejected
    if (g.includes('ضعيف جدا')) return 7;         // Very weak
    if (g.includes('ضعيف')) return 6;             // Weak
    if (g.includes('لا بأس به')) return 5;        // Acceptable
    if (g.includes('إسناده حسن')) return 4;       // Good chain
    if (g.includes('إسناده صحيح')) return 3;      // Authentic chain
    if (g.includes('حسن')) return 2;              // Good
    if (g.includes('صحيح')) return 1;             // Authentic
    return 50;
}

// Helper: parse sharh HTML from Dorar website
function parseSharhHTML(html) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const results = [];

    // Dorar sharh page uses div.hadith-sharh or similar patterns
    // The sharh search with t=3 returns sharh content alongside hadiths
    const sharhDivs = doc.querySelectorAll('.sharh, .hadith-sharh, [class*="sharh"]');

    if (sharhDivs.length > 0) {
        sharhDivs.forEach(div => {
            results.push(div.textContent.trim());
        });
    }

    // Also try to extract from the general result structure
    if (results.length === 0) {
        // Fallback: look for any text content that looks like sharh
        const allDivs = doc.querySelectorAll('div.hadith');
        allDivs.forEach(div => {
            const text = div.textContent.trim();
            if (text.length > 50) {
                results.push(text);
            }
        });
    }

    return results;
}

// Normalize Arabic text: remove tashkeel + replace all punctuation with spaces + collapse spaces
function normalizeArabic(text) {
    if (!text) return '';
    // Remove tashkeel
    let t = removeTashkeel(text);
    // Replace ﷺ with spelled out form
    t = t.replace(/\uFDFA/g, 'صلى الله عليه وسلم');
    // Replace all non-Arabic-letter, non-space chars with space (removes ، ـ " . etc)
    t = t.replace(/[^\u0621-\u064A\s]/g, ' ');
    // Collapse multiple spaces
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

// Extract matn (Prophet's actual words) from full hadith text that includes isnad
function extractMatn(fullText) {
    if (!fullText) return fullText;

    const normalized = normalizeArabic(fullText);
    console.log(`[Dorar] Normalized text: "${normalized.slice(0, 120)}..."`);

    // Separator phrases: everything AFTER these is the matn
    const separators = [
        'قال رسول الله صلى الله عليه وسلم',
        'قال النبي صلى الله عليه وسلم',
        'يقول رسول الله صلى الله عليه وسلم',
        'سمعت رسول الله صلى الله عليه وسلم يقول',
        'سمعت النبي صلى الله عليه وسلم يقول',
        'ان رسول الله صلى الله عليه وسلم قال',
        'ان النبي صلى الله عليه وسلم قال',
        'عن رسول الله صلى الله عليه وسلم انه قال',
        'عن النبي صلى الله عليه وسلم انه قال',
        'عن رسول الله صلى الله عليه وسلم قال',
        'عن النبي صلى الله عليه وسلم قال',
        'رسول الله صلى الله عليه وسلم',
        'النبي صلى الله عليه وسلم',
    ];

    for (const sep of separators) {
        const idx = normalized.indexOf(sep);
        if (idx >= 0) {
            const afterSep = normalized.slice(idx + sep.length).trim();
            if (afterSep.length > 10) {
                console.log(`[Dorar] ✓ Extracted matn: "${afterSep.slice(0, 80)}..."`);
                return afterSep;
            }
        }
    }

    // Fallback: if starts with isnad words, find the LAST "قال" and take text after it
    const isnadStarters = ['حدثنا', 'اخبرنا', 'حدثني', 'اخبرني', 'وحدثني', 'وحدثنا'];
    const firstWord = normalized.split(' ')[0];
    if (isnadStarters.includes(firstWord)) {
        // Find all occurrences of "قال" and use the last one
        let lastQalaIdx = -1;
        let searchFrom = 0;
        while (true) {
            const idx = normalized.indexOf('قال', searchFrom);
            if (idx === -1) break;
            lastQalaIdx = idx;
            searchFrom = idx + 3;
        }
        if (lastQalaIdx > 10) {
            const afterQala = normalized.slice(lastQalaIdx + 3).trim();
            if (afterQala.length > 10) {
                console.log(`[Dorar] ✓ Extracted matn (fallback قال): "${afterQala.slice(0, 80)}..."`);
                return afterQala;
            }
        }
    }

    console.log(`[Dorar] ✗ Could not extract matn, using full text`);
    return normalized;
}

app.get('/api/hadith/sharh', async (req, res) => {
    try {
        const { text } = req.query;
        if (!text) return res.status(400).json({ error: 'text required' });

        // Extract matn (actual hadith text, not isnad/chain) - extractMatn handles normalization
        const matn = extractMatn(text);
        // Take first 8 words for search
        const searchWords = removeTashkeel(matn).split(/\s+/).filter(w => w.length > 1).slice(0, 8).join(' ');
        const encoded = encodeURIComponent(searchWords);

        console.log(`[Dorar] Searching for: "${searchWords}"`);

        // Make two parallel calls: one for takhrij, one for sharh
        const [takhrijRes, sharhRes] = await Promise.allSettled([
            // 1) Takhrij from Dorar API
            fetch(`https://dorar.net/dorar_api.json?skey=${encoded}`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(10000)
            }).then(r => r.json()),

            // 2) Sharh from Dorar API (t=3 scope = شروح الأحاديث)
            fetch(`https://dorar.net/dorar_api.json?skey=${encoded}&t=3`, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(10000)
            }).then(r => r.json())
        ]);

        // Parse takhrij results
        let takhrij = [];
        if (takhrijRes.status === 'fulfilled') {
            const htmlResult = takhrijRes.value.ahadith?.result;
            if (htmlResult && !htmlResult.includes('لا يوجد نتائج')) {
                takhrij = parseTakhrijHTML(htmlResult);
            }
        }

        // Parse sharh results
        let sharh = [];
        if (sharhRes.status === 'fulfilled') {
            const sharhHtml = sharhRes.value.ahadith?.result;
            if (sharhHtml && !sharhHtml.includes('لا يوجد نتائج')) {
                const sharhParsed = parseTakhrijHTML(sharhHtml);
                sharh = sharhParsed;
            }
        }

        const found = takhrij.length > 0 || sharh.length > 0;
        res.json({ found, takhrij, sharh });

    } catch (error) {
        console.error('Dorar proxy error:', error.message);
        res.json({ found: false, takhrij: [], sharh: [] });
    }
});

// ─── Tafsir API Proxy ──────────────────────────────────────────────
app.get('/api/tafsir/:tafsirId/:surahNumber/:ayahNumber', async (req, res) => {
    try {
        const { tafsirId, surahNumber, ayahNumber } = req.params;
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`http://api.quran-tafseer.com/tafseer/${tafsirId}/${surahNumber}/${ayahNumber}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching tafsir:', error);
        res.status(500).json({ message: 'Error fetching tafsir data' });
    }
});

// ─── Categories ───────────────────────────────────────
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});
const Category = mongoose.model('Category', CategorySchema);

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ date: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, adminEmail } = req.body;
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'هذا التصنيف موجود بالفعل' });
        }
        res.status(500).json({ message: 'Error adding category' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
});

// ─── Live Streams (TV/Radio) ──────────────────────────
const LiveStreamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['tv', 'radio'], required: true },
    category: { type: String, default: '' },
    addedBy: { type: String },
    date: { type: Date, default: Date.now }
});
const LiveStream = mongoose.model('LiveStream', LiveStreamSchema);

app.get('/api/livestreams', async (req, res) => {
    try {
        const { category } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        const streams = await LiveStream.find(query).sort({ date: -1 });
        res.json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live streams' });
    }
});

app.post('/api/livestreams', async (req, res) => {
    try {
        const { title, url, type, category, adminEmail } = req.body;
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        const newStream = new LiveStream({ title, url, type, category: category || '', addedBy: adminEmail });
        await newStream.save();
        res.status(201).json(newStream);
    } catch (error) {
        res.status(500).json({ message: 'Error adding live stream' });
    }
});

app.delete('/api/livestreams/:id', async (req, res) => {
    try {
        const { adminEmail } = req.query;
        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await LiveStream.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Live stream deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting live stream' });
    }
});

// ─── Ulama (Scholars) with Data, Audio, and Video ───────────────────────────
const UlamaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String },
    style: { type: String },
    image: { type: String },
    bio: { type: String },

    // Data/Articles
    articles: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String },
        category: { type: String },
        date: { type: Date, default: Date.now }
    }],

    // Audio Content
    audios: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String, required: true },
        category: { type: String },
        description: { type: String },
        duration: { type: Number }, // in seconds
        date: { type: Date, default: Date.now }
    }],

    // Video Content
    videos: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        url: { type: String, required: true },
        thumbnail: { type: String },
        category: { type: String },
        description: { type: String },
        duration: { type: Number }, // in seconds
        date: { type: Date, default: Date.now }
    }],

    addedBy: { type: String },
    date: { type: Date, default: Date.now }
});

const Ulama = mongoose.model('Ulama', UlamaSchema);

// GET all Ulama scholars
app.get('/api/ulama', async (req, res) => {
    try {
        const { search, sort } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { style: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOption = sort === 'newest' ? { date: -1 } : { name: 1 };
        const ulama = await Ulama.find(query).sort(sortOption).lean();
        res.json(ulama);
    } catch (error) {
        console.error('Error fetching ulama:', error);
        res.status(500).json({ message: 'Error fetching ulama' });
    }
});

// Helper: find Ulama by slug first, then by _id as fallback
async function findUlama(idOrSlug) {
    let ulama = await Ulama.findOne({ slug: idOrSlug });
    if (!ulama && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        ulama = await Ulama.findById(idOrSlug);
    }
    return ulama;
}

// GET single Ulama scholar by slug or ID
app.get('/api/ulama/:id', async (req, res) => {
    try {
        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });
        res.json(ulama);
    } catch (error) {
        console.error('Error fetching ulama:', error);
        res.status(500).json({ message: 'Error fetching ulama' });
    }
});

// POST create new Ulama scholar
app.post('/api/ulama', async (req, res) => {
    try {
        const { name, description, style, image, bio, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized: Only admin can create ulama entries' });
        }

        // Generate slug
        let baseSlug = name.trim().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A\u0660-\u0669\-]/g, '');
        if (!baseSlug) baseSlug = 'ulama';
        let slug = baseSlug;
        let counter = 1;
        while (await Ulama.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newUlama = new Ulama({
            name,
            slug,
            description,
            style,
            image,
            bio,
            addedBy: adminEmail
        });

        await newUlama.save();
        res.status(201).json(newUlama);
    } catch (error) {
        console.error('Error creating ulama:', error);
        res.status(500).json({ message: 'Error creating ulama' });
    }
});

// PUT update Ulama scholar
app.put('/api/ulama/:id', async (req, res) => {
    try {
        const { name, description, style, image, bio, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        if (name) ulama.name = name;
        if (description) ulama.description = description;
        if (style) ulama.style = style;
        if (image) ulama.image = image;
        if (bio) ulama.bio = bio;

        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error updating ulama:', error);
        res.status(500).json({ message: 'Error updating ulama' });
    }
});

// DELETE Ulama scholar
app.delete('/api/ulama/:id', async (req, res) => {
    try {
        const { adminEmail } = req.query;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });
        await Ulama.findByIdAndDelete(ulama._id);
        res.status(200).json({ message: 'Ulama deleted successfully' });
    } catch (error) {
        console.error('Error deleting ulama:', error);
        res.status(500).json({ message: 'Error deleting ulama' });
    }
});

// ─── ARTICLES ───────────────────────────────────────────────────────────────
// POST add article to Ulama scholar
app.post('/api/ulama/:id/articles', async (req, res) => {
    try {
        const { title, content, category, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        const articleId = Date.now().toString();
        ulama.articles.push({
            id: articleId,
            title,
            content,
            category
        });

        await ulama.save();
        res.status(201).json(ulama);
    } catch (error) {
        console.error('Error adding article:', error);
        res.status(500).json({ message: 'Error adding article' });
    }
});

// DELETE article from Ulama scholar
app.delete('/api/ulama/:id/articles/:articleId', async (req, res) => {
    try {
        const { adminEmail } = req.query;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        ulama.articles = ulama.articles.filter(a => a.id !== req.params.articleId);
        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ message: 'Error deleting article' });
    }
});

// ─── AUDIO ──────────────────────────────────────────────────────────────────
// POST add audio to Ulama scholar
app.post('/api/ulama/:id/audios', async (req, res) => {
    try {
        const { title, url, category, description, duration, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        const audioId = Date.now().toString();
        ulama.audios.push({
            id: audioId,
            title,
            url,
            category,
            description,
            duration
        });

        await ulama.save();
        res.status(201).json(ulama);
    } catch (error) {
        console.error('Error adding audio:', error);
        res.status(500).json({ message: 'Error adding audio' });
    }
});

// PUT update audio in Ulama scholar
app.put('/api/ulama/:id/audios/:audioId', async (req, res) => {
    try {
        const { title, url, category, description, duration, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        const audio = ulama.audios.find(a => a.id === req.params.audioId);
        if (!audio) return res.status(404).json({ message: 'Audio not found' });

        if (title) audio.title = title;
        if (url) audio.url = url;
        if (category !== undefined) audio.category = category;
        if (description !== undefined) audio.description = description;
        if (duration !== undefined) audio.duration = duration;

        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error updating audio:', error);
        res.status(500).json({ message: 'Error updating audio' });
    }
});

// DELETE audio from Ulama scholar
app.delete('/api/ulama/:id/audios/:audioId', async (req, res) => {
    try {
        const { adminEmail } = req.query;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        ulama.audios = ulama.audios.filter(a => a.id !== req.params.audioId);
        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error deleting audio:', error);
        res.status(500).json({ message: 'Error deleting audio' });
    }
});

// ─── VIDEO ──────────────────────────────────────────────────────────────────
// POST add video to Ulama scholar
app.post('/api/ulama/:id/videos', async (req, res) => {
    try {
        const { title, url, thumbnail, category, description, duration, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        const videoId = Date.now().toString();
        ulama.videos.push({
            id: videoId,
            title,
            url,
            thumbnail,
            category,
            description,
            duration
        });

        await ulama.save();
        res.status(201).json(ulama);
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).json({ message: 'Error adding video' });
    }
});

// PUT update video in Ulama scholar
app.put('/api/ulama/:id/videos/:videoId', async (req, res) => {
    try {
        const { title, url, thumbnail, category, description, duration, adminEmail } = req.body;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        const video = ulama.videos.find(v => v.id === req.params.videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (title) video.title = title;
        if (url) video.url = url;
        if (thumbnail !== undefined) video.thumbnail = thumbnail;
        if (category !== undefined) video.category = category;
        if (description !== undefined) video.description = description;
        if (duration !== undefined) video.duration = duration;

        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ message: 'Error updating video' });
    }
});

// DELETE video from Ulama scholar
app.delete('/api/ulama/:id/videos/:videoId', async (req, res) => {
    try {
        const { adminEmail } = req.query;

        if (adminEmail !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const ulama = await findUlama(req.params.id);
        if (!ulama) return res.status(404).json({ message: 'Ulama not found' });

        ulama.videos = ulama.videos.filter(v => v.id !== req.params.videoId);
        await ulama.save();
        res.json(ulama);
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

