
import React, { useState } from 'react';
import { Book } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface BookListItemProps {
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


const BookListItem: React.FC<BookListItemProps> = ({ book, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl w-full hover:bg-white/10 transition-colors duration-200">
      <img src={book.coverUrl} alt={book.title} className="w-12 h-[72px] object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-white truncate">{book.title}</h3>
        <p className="text-sm text-gray-400 truncate">{book.authors.join(', ')}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full hover:bg-[#E8A04C]/20 text-gray-300 hover:text-[#E8A04C] transition"><EditIcon className="w-5 h-5" /></button>
        <button onClick={() => onDelete(book.isbn)} className="p-2 rounded-full hover:bg-red-500/20 text-gray-300 hover:text-red-500 transition"><TrashIcon className="w-5 h-5" /></button>
      </div>
    </div>
    {isModalOpen && <EditModal book={book} onSave={onUpdate} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default BookListItem;
