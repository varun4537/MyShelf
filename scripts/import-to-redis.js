// Direct Redis import script
// Uses REDIS_URL to insert books directly

const ISBNS = [
    '9780553812171', '9780553813116', '9780553813123', '9780553813130',
    '9780553813147', '9780553813154', '9780553813161', '9780553813192',
    '9780553824808', '9780553825607', '9780747532743', '9780747538486',
    '9780747542155', '9780747546245', '9780747551003', '9780747581086',
    '9780747591054', '9780451457813', '9780451458124', '9780451458445',
    '9780451459039', '9780451459404', '9780451459893', '9780451460646',
    '9780451461254', '9780451461933', '9780451462565', '9780451463173',
    '9780451463890', '9780451464378', '9780451464972', '9780451465481',
    '9780451467454', '9780451468901', '9780451469519', '9780345339706',
    '9780345339713', '9780345339737', '9780812511819', '9780812517729',
    '9780812513714', '9780812513738', '9780812513752', '9780812513783',
    '9780812513790', '9780812513813', '9780812513820', '9780812513844',
    '9780812513851', '9780765325851', '9780765325943', '9780765325950'
];

const LIBRARY_KEY = 'myshelf:library';

// Create placeholder books from ISBNs
const createBooks = () => {
    return ISBNS.map((isbn, index) => ({
        isbn,
        title: `Book ${index + 1}`,
        authors: ['Unknown Author'],
        genre: ['Uncategorized'],
        description: 'Book imported via bulk ISBN list',
        pageCount: 0,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
        dateAdded: new Date(Date.now() - index * 1000).toISOString(),
        readingStatus: 'unread',
        rating: null,
        favorite: false,
        notes: ''
    }));
};

async function importToRedis() {
    const REDIS_URL = process.env.REDIS_URL;

    if (!REDIS_URL) {
        console.error('❌ REDIS_URL environment variable not set');
        console.log('Please set it: $env:REDIS_URL="your-redis-url"');
        process.exit(1);
    }

    console.log(`📚 Importing ${ISBNS.length} books to Redis...`);
    console.log(`🔗 Using Redis: ${REDIS_URL.replace(/:\/\/.*@/, '://***@')}`);

    try {
        // Dynamic import for Redis client
        const { createClient } = await import('redis');

        const client = createClient({
            url: REDIS_URL
        });

        client.on('error', (err) => console.error('Redis Client Error:', err));

        await client.connect();
        console.log('✅ Connected to Redis');

        // Get existing library
        const existing = await client.get(LIBRARY_KEY);
        let library = existing ? JSON.parse(existing) : [];
        console.log(`📦 Existing library: ${library.length} books`);

        // Create new books
        const newBooks = createBooks();

        // Filter out duplicates
        const existingIsbns = new Set(library.map(b => b.isbn));
        const booksToAdd = newBooks.filter(b => !existingIsbns.has(b.isbn));

        console.log(`➕ Adding ${booksToAdd.length} new books`);

        // Merge and save
        library = [...booksToAdd, ...library];
        await client.set(LIBRARY_KEY, JSON.stringify(library));

        console.log(`✅ Import complete!`);
        console.log(`📚 Total library size: ${library.length} books`);

        await client.disconnect();

    } catch (error) {
        console.error('❌ Import failed:', error.message);
