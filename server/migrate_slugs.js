require('dotenv').config();
const mongoose = require('mongoose');

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

async function generateUniqueSlug(title) {
    let baseSlug = title.trim().replace(/\s+/g, '-').replace(/[^\w\u0621-\u064A\u0660-\u0669\-]/g, '');
    if (!baseSlug) baseSlug = 'post';
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

async function migrateSlugs() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quran_app');
        console.log('MongoDB Connected. Starting migration...');

        const posts = await Post.find({ slug: { $exists: false } });
        console.log(`Found ${posts.length} posts without slugs.`);

        for (const post of posts) {
            const slug = await generateUniqueSlug(post.title);
            post.slug = slug;
            await post.save();
            console.log(`Migrated post "${post.title}" -> slug: ${slug}`);
        }

        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

migrateSlugs();
