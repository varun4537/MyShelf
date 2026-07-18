import { Book } from '../types';

const normalize = (s: string): string =>
    s.toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '') // strip accents
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

// Compare titles ignoring subtitles and edition suffixes:
// "Dune: Deluxe Edition" and "Dune (Penguin Classics)" both -> "dune"
const normalizeTitle = (title: string): string => normalize(title.split(/[:(]/)[0]);

const authorsOverlap = (a: string[], b: string[]): boolean => {
    const setA = a.map(normalize).filter(Boolean);
    const setB = b.map(normalize).filter(Boolean);
    // If either side has no usable author data, rely on the title match alone
    if (setA.length === 0 || setB.length === 0) return true;
    return setA.some(author => setB.includes(author));
};

/**
 * Find a book already in the library that looks like a different edition
 * of the candidate: same normalized title by the same author, but a
 * different ISBN (e.g. paperback vs hardcover).
 */
export const findDuplicateEdition = (
    candidate: Pick<Book, 'isbn' | 'title' | 'authors'>,
    library: Book[]
): Book | undefined => {
    const title = normalizeTitle(candidate.title);
    if (!title) return undefined;
    return library.find(
        b =>
            b.isbn !== candidate.isbn &&
            normalizeTitle(b.title) === title &&
            authorsOverlap(b.authors, candidate.authors)
    );
};
