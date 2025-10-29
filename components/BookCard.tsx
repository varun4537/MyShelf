
import React, { useState } from 'react';
import { Book } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface BookCardProps {
  book: Book;
  onDelete: (isbn: string) => void;
  onUpdate: (book: Book) => void;
}

const EditModal: React.FC<{ book: Book; onSave: (book: Book) => void; onClose: () => void }> = ({ book, onSave, onClose }) => {
    const [editedBook, setEditedBook] = useState(book);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'authors' || name === 'genre') {
            setEditedBook({ ...editedBook, [name]: value.split(',').map(item => item.trim()) });
        } else {
            setEditedBook({ ...editedBook, [name]: value });
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#1a1a1c] border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Edit Book</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <input name="title" value={editedBook.title} onChange={handleChange} placeholder="Title" className="w-full bg-white/10 p-2 rounded-md" />
                    <input name="authors" value={editedBook.authors.join(', ')} onChange={handleChange} placeholder="Authors (comma-separated)" className="w-full bg-white/10 p-2 rounded-md" />
                    <input name="genre" value={editedBook.genre.join(', ')} onChange={handleChange} placeholder="Genres (comma-separated)" className="w-full bg-white/10 p-2 rounded-md" />
                    <textarea name="description" value={editedBook.description} onChange={handleChange} placeholder="Description" className="w-full bg-white/10 p-2 rounded-md h-24" />
                    <input name="coverUrl" value={editedBook.coverUrl} onChange={handleChange} placeholder="Cover Image URL" className="w-full bg-white/10 p-2 rounded-md" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-md">Cancel</button>
                    <button onClick={() => { onSave(editedBook); onClose(); }} className="px-4 py-2 bg-[#E8A04C] text-black rounded-md font-semibold">Save</button>
                </div>
            </div>
        </div>
    );
};


const BookCard: React.FC<BookCardProps> = ({ book, onDelete, onUpdate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div 
        className="relative group aspect-[2/3] overflow-hidden rounded-2xl transition-all duration-300 transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute bottom-0 left-0 p-3 w-full">
            <h3 className="font-bold text-white text-sm truncate">{book.title}</h3>
            <p className="text-xs text-gray-300 truncate">{book.authors.join(', ')}</p>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
            <button onClick={() => setIsModalOpen(true)} className="p-2 bg-black/50 rounded-full hover:bg-[#E8A04C] text-white transition"><EditIcon className="w-4 h-4" /></button>
            <button onClick={() => onDelete(book.isbn)} className="p-2 bg-black/50 rounded-full hover:bg-red-500 text-white transition"><TrashIcon className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
    {isModalOpen && <EditModal book={book} onSave={onUpdate} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default BookCard;
