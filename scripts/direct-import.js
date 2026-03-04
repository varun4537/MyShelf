// Direct import to Redis - bypasses book lookup API
// Books will be added with ISBN only, you can edit details in the app

const ISBNS = [
    '9780765348791', '9780765348807', '9780765348845', '9780765348876',
    '9780765348838', '9780765348852', '9780765348869', '9781338878929',
    '9781546154419', '9780545791434', '9781338815283', '9780545791342',
    '9780545791328', '9780545791441', '9781250768681', '9780000003294',
    '9781250846402', '9780765336460'
];

const AUTH_HEADER = 'Bearer ' + Buffer.from('Mybooks:quickscan123').toString('base64');

async function directImport() {
    console.log(`Starting direct import of ${ISBNS.length} ISBNs to Redis...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const isbn of ISBNS) {
        // Create minimal book object
        const book = {
            isbn: isbn,
            title: `Book ${isbn}`,
            authors: ['Unknown Author'],
            genre: ['Uncategorized'],
            description: 'Book imported via ISBN. Edit to add details.',
            pageCount: 0,
            dateAdded: new Date().toISOString(),
            readingStatus: 'unread',
            rating: null,
            favorite: false,
            notes: '',
            coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        };

        try {
            const response = await fetch('https://my-shelf-beryl.vercel.app/api/library', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_HEADER
                },
                body: JSON.stringify(book)
            });

            const responseText = await response.text();

            if (response.ok) {
                console.log(`✅ Added ISBN: ${isbn}`);
                successCount++;
            } else if (response.status === 200) {
                console.log(`ℹ️  Already exists: ${isbn}`);
                successCount++;
            } else {
                console.log(`❌ Failed: ${isbn} (${response.status}) - ${responseText}`);
                failCount++;
            }
        } catch (error) {
            console.error(`❌ Error adding ${isbn}:`, error.message);
            failCount++;
        }

        // Small delay to be polite
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\nImport Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

directImport();
