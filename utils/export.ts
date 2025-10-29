
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

    const headers = ['isbn', 'title', 'authors', 'genre', 'dateAdded', 'description', 'pageCount', 'coverUrl'];
    const csvRows = [headers.join(',')];

    books.forEach(book => {
        const authors = `"${book.authors.join(', ')}"`;
        const genre = `"${book.genre.join(', ')}"`;
        const title = `"${book.title.replace(/"/g, '""')}"`;
        const description = `"${book.description.replace(/"/g, '""')}"`;

        const row = [book.isbn, title, authors, genre, book.dateAdded, description, book.pageCount, book.coverUrl];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    downloadFile('MyShelf_Library.csv', csvString, 'text/csv');
};
