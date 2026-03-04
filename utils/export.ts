
import { Book } from '../types';

const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

export const exportToJSON = (books: Book[]) => {
    const jsonString = JSON.stringify(books, null, 2);
    downloadFile('MyShelf_Library.json', jsonString, 'application/json');
};

export const exportToCSV = (books: Book[]) => {
    if (books.length === 0) return;

    // Include all book fields including V2 fields
    const headers = [
        'isbn', 'title', 'authors', 'genre', 'dateAdded', 'description', 
        'pageCount', 'coverUrl', 'readingStatus', 'rating', 'notes', 
        'favorite', 'publisher', 'publishYear', 'language', 'series', 'seriesOrder'
    ];
    const csvRows = [headers.join(',')];

    const escapeCSV = (value: string | number | boolean | null | undefined): string => {
        if (value === null || value === undefined) return '""';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return `"${str}"`;
    };

    books.forEach(book => {
        const row = [
            escapeCSV(book.isbn),
            escapeCSV(book.title),
            escapeCSV(book.authors.join(', ')),
            escapeCSV(book.genre.join(', ')),
            escapeCSV(book.dateAdded),
            escapeCSV(book.description),
            escapeCSV(book.pageCount),
            escapeCSV(book.coverUrl),
            escapeCSV(book.readingStatus),
            escapeCSV(book.rating),
            escapeCSV(book.notes),
            escapeCSV(book.favorite),
            escapeCSV(book.publisher || ''),
            escapeCSV(book.publishYear || ''),
            escapeCSV(book.language || ''),
            escapeCSV(book.series || ''),
            escapeCSV(book.seriesOrder || ''),
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    downloadFile('MyShelf_Library.csv', csvString, 'text/csv');
};
