
// Native fetch is available in Node 18+

const ISBNS = [
    '9780765348791', '9780765348807', '9780765348845', '9780765348876',
    '9780765348838', '9780765348852', '9780765348869', '9781338878929',
    '9781546154419', '9780545791434', '9781338815283', '9780545791342',
    '9780545791328', '9780545791441', '9781250768681', '9780000003294',
    '9781250846402', '9780765336460'
];

const BASE_URL = 'https://my-shelf-eta.vercel.app';
const AUTH_HEADER = 'Bearer ' + Buffer.from('Mybooks:quickscan123').toString('base64');

async function importBooks() {
    console.log(`Starting import of ${ISBNS.length} books...`);

    let successCount = 0;
    let failCount = 0;

    for (const isbn of ISBNS) {
        try {
            console.log(`Fetching metadata for ${isbn}...`);

            // 1. Fetch Metadata
            const metadataRes = await fetch(`${BASE_URL}/api/book?isbn=${isbn}`);

            if (!metadataRes.ok) {
                console.error(`❌ Failed to fetch metadata for ${isbn}: ${metadataRes.status}`);
                failCount++;
                continue;
            }

            const bookData = await metadataRes.json();

            // Add default fields needed for the library
            const fullBook = {
                ...bookData,
                dateAdded: new Date().toISOString(),
                readingStatus: 'unread',
                rating: null,
                favorite: false,
                notes: ''
            };

            // 2. Add to Library
            const saveRes = await fetch(`${BASE_URL}/api/library`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_HEADER
                },
                body: JSON.stringify(fullBook)
            });

            if (saveRes.ok) {
                console.log(`✅ Added: ${bookData.title}`);
                successCount++;
            } else {
                console.error(`❌ Failed to save ${isbn}: ${saveRes.status}`);
                failCount++;
            }

            // Polite delay
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`❌ Error processing ${isbn}:`, error);
            failCount++;
        }
    }

    console.log(`\nImport Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
}

importBooks();
