// components/BooksSection.tsx
"use client";

import React, { useState } from "react";
import {
  Plus,
  Book,
  Loader2,
  X,
  Star,
  CheckCircle2,
  BookOpen,
  BookMarked,
  CheckCircle,
  Trash2,
} from "lucide-react";

// ✅ Updated to match the Book type from types/index.ts
interface BookType {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  status: "to-read" | "reading" | "completed";
  rating?: number;
  createdAt: string | Date; // ✅ Added
  updatedAt: string | Date; // ✅ Added
  userId?: string; // ✅ Added for consistency
}

interface BooksSectionProps {
  books: BookType[];
  setBooks: (books: BookType[]) => void;
  updateBook: (book: Partial<BookType> & { id: string }) => void;
  onSessionsUpdate?: () => void;
}

export default function BooksSection({
  books,
  setBooks,
  updateBook,
  onSessionsUpdate,
}: BooksSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    totalPages: "",
  });
  const [logPages, setLogPages] = useState<{ [key: string]: number }>({});
  const [updatingStatus, setUpdatingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [loggingPages, setLoggingPages] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [deletingBook, setDeletingBook] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [filterStatus, setFilterStatus] = useState;
  "all" | "to-read" | "reading" | ("completed" > "all");

  // ADD BOOK
  const handleAddBook = async () => {
    const title = newBook.title.trim();
    const author = newBook.author.trim();
    const totalPages = Number(newBook.totalPages);

    if (!title || !author || totalPages <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, totalPages }),
      });

      if (!res.ok) throw new Error("Failed to add book");

      const savedBook: BookType = await res.json();
      setBooks([...books, savedBook]);
      setNewBook({ title: "", author: "", totalPages: "" });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add book");
    } finally {
      setIsAdding(false);
    }
  };

  // DELETE BOOK
  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${bookTitle}"? This will also delete all reading sessions for this book.`
    );

    if (!confirmDelete) return;

    setDeletingBook((prev) => ({ ...prev, [bookId]: true }));

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete: ${errorText}`);
      }

      // Remove book from state
      setBooks(books.filter((b) => b.id !== bookId));

      // Refresh sessions if callback provided
      if (onSessionsUpdate) {
        onSessionsUpdate();
      }
    } catch (err) {
      console.error("❌ Delete book error:", err);
      alert(
        `Failed to delete book: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setDeletingBook((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // CHANGE STATUS
  const handleStatusChange = async (
    bookId: string,
    newStatus: BookType["status"]
  ) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookId]: true }));

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update: ${errorText}`);
      }

      const updated = await res.json();
      updateBook(updated);
    } catch (err) {
      console.error("❌ Status update error:", err);
      alert(
        `Failed to update status: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // LOG PAGES
  const handleLogPages = async (bookId: string) => {
    const pages = logPages[bookId] || 0;
    if (pages <= 0) return alert("Enter pages > 0");

    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const newCurrentPage = Math.min(book.currentPage + pages, book.totalPages);
    const isCompleted = newCurrentPage >= book.totalPages;

    setLoggingPages((prev) => ({ ...prev, [bookId]: true }));

    try {
      const res = await fetch("/api/reading-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          pagesRead: pages,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to log pages");
      }

      const { book: updatedBook } = await res.json();
      updateBook(updatedBook);
      setLogPages((prev) => ({ ...prev, [bookId]: 0 }));

      if (onSessionsUpdate) {
        onSessionsUpdate();
      }

      if (isCompleted) {
        alert(`Congratulations! You finished "${book.title}"!`);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to log pages";
      alert(errorMessage);
    } finally {
      setLoggingPages((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // RATE BOOK
  const handleRating = async (bookId: string, rating: number) => {
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (!res.ok) throw new Error("Failed");

      const updated = await res.json();
      updateBook(updated);
    } catch {
      alert("Failed to save rating");
    }
  };

  // Filter books
  const filteredBooks =
    filterStatus === "all"
      ? books
      : books.filter((b) => b.status === filterStatus);

  const statusCounts = {
    all: books.length,
    "to-read": books.filter((b) => b.status === "to-read").length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-[#DBDAAE] lg:col-span-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#5D6939] to-[#AAB97E] rounded-xl">
            <Book className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-xl md:text-2xl text-[#5D6939]">
              My Library
            </h3>
            <p className="text-xs md:text-sm text-[#AAB97E]">
              {books.length} {books.length === 1 ? "book" : "books"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full sm:w-auto bg-[#5D6939] text-white px-4 md:px-5 py-2.5 md:py-3 rounded-xl hover:bg-[#4a552d] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-bold text-sm md:text-base">Add Book</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All Books", icon: Book },
          { key: "reading", label: "Reading", icon: BookOpen },
          { key: "to-read", label: "Want to Read", icon: BookMarked },
          { key: "completed", label: "Finished", icon: CheckCircle },
        ].map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === filter.key
                  ? "bg-[#5D6939] text-white shadow-md"
                  : "bg-[#FAF2E5] text-[#5D6939] hover:bg-[#DBDAAE]/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>
                {filter.label}
                <span className="ml-1 opacity-70">
                  ({statusCounts[filter.key as keyof typeof statusCounts]})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-[#FAF2E5] rounded-xl p-4 md:p-6 mb-6 shadow-md border-2 border-[#DBDAAE]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-base md:text-lg text-[#5D6939]">
              Add New Book
            </h4>
            <button
              onClick={() => setShowAdd(false)}
              className="p-1 hover:bg-white rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5 text-[#5D6939]" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] focus:outline-none text-sm md:text-base"
              disabled={isAdding}
            />
            <input
              placeholder="Author Name"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] focus:outline-none text-sm md:text-base"
              disabled={isAdding}
            />
            <input
              type="number"
              placeholder="Total Pages"
              value={newBook.totalPages}
              onChange={(e) =>
                setNewBook({ ...newBook, totalPages: e.target.value })
              }
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] focus:outline-none text-sm md:text-base"
              disabled={isAdding}
            />
            <button
              onClick={handleAddBook}
              disabled={isAdding}
              className="w-full bg-[#5D6939] text-white py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4a552d] transition-all disabled:opacity-50 cursor-pointer text-sm md:text-base"
            >
              {isAdding && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAdding ? "Adding..." : "Add to Library"}
            </button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-[#FAF2E5] rounded-xl border-2 border-dashed border-[#DBDAAE]">
          <Book className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-[#AAB97E]" />
          <p className="text-sm md:text-base text-[#5D6939]/70 font-medium">
            {filterStatus === "all"
              ? "No books yet. Start building your library!"
              : `No ${filterStatus.replace("-", " ")} books`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredBooks.map((book) => {
            const progress = Math.round(
              (book.currentPage / book.totalPages) * 100
            );
            const rating = book.rating || 0;

            return (
              <div
                key={book.id}
                className="bg-gradient-to-br from-white to-[#FAF2E5] rounded-xl p-4 md:p-5 shadow-md border-2 border-[#DBDAAE] hover:shadow-xl transition-all relative"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteBook(book.id, book.title)}
                  disabled={deletingBook[book.id]}
                  className="absolute top-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-all cursor-pointer disabled:opacity-50 group"
                  title="Delete book"
                >
                  {deletingBook[book.id] ? (
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                  )}
                </button>

                {/* Book Header */}
                <div className="flex justify-between items-start mb-3 pr-8">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-[#5D6939] truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs md:text-sm text-[#AAB97E] italic truncate">
                      {book.author}
                    </p>
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200 shrink-0 ml-2">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs md:text-sm font-bold text-yellow-700">
                        {rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Info */}
                <div className="flex items-center justify-between text-xs md:text-sm mb-3">
                  <span className="text-[#5D6939]/70 font-medium">
                    {book.currentPage} / {book.totalPages} pages
                  </span>
                  <span className="font-black text-[#5D6939]">{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#DBDAAE]/30 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#AAB97E] to-[#5D6939] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Status Selector */}
                <select
                  value={book.status}
                  onChange={(e) =>
                    handleStatusChange(
                      book.id,
                      e.target.value as BookType["status"]
                    )
                  }
                  disabled={updatingStatus[book.id]}
                  className="w-full mb-3 px-3 py-2 border-2 border-[#DBDAAE] rounded-lg bg-white text-xs md:text-sm font-medium text-[#5D6939] cursor-pointer focus:border-[#5D6939] focus:outline-none"
                >
                  <option value="to-read">Want to Read</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Finished</option>
                </select>

                {/* Log Pages Input */}
                {book.status === "reading" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Pages read"
                      className="flex-1 px-3 py-2 border-2 border-[#DBDAAE] rounded-lg text-xs md:text-sm focus:border-[#5D6939] focus:outline-none"
                      value={logPages[book.id] || ""}
                      onChange={(e) =>
                        setLogPages({
                          ...logPages,
                          [book.id]: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <button
                      onClick={() => handleLogPages(book.id)}
                      disabled={loggingPages[book.id]}
                      className="bg-[#5D6939] text-white px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-[#4a552d] transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {loggingPages[book.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Log
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Rating Section */}
                {book.status === "completed" && rating === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs md:text-sm font-bold text-[#5D6939] mb-2">
                      Rate this book:
                    </p>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRating(book.id, r)}
                          className="hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star className="w-6 h-6 md:w-7 md:h-7 text-yellow-400 hover:text-yellow-500 hover:fill-yellow-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
