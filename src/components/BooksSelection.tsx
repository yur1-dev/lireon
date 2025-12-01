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
  AlertTriangle,
} from "lucide-react";

interface BookType {
  id: string;
  title: string;
  author: string;
  currentPage: number;
  totalPages: number;
  status: "to-read" | "reading" | "completed";
  rating?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId?: string;
}

interface BooksSectionProps {
  books: BookType[];
  setBooks: (books: BookType[]) => void;
  updateBook: (book: Partial<BookType> & { id: string }) => void;
  onSessionsUpdate?: () => void;
  // Optional: for better cache busting in parent
  onRefresh?: () => Promise<void>;
}

export default function BooksSection({
  books,
  setBooks,
  updateBook,
  onSessionsUpdate,
  onRefresh,
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
  const [filterStatus, setFilterStatus] = useState<
    "all" | "to-read" | "reading" | "completed"
  >("all");

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    bookId: string;
    bookTitle: string;
  } | null>(null);

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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add book");
      }

      const savedBook: BookType = await res.json();
      setBooks([...books, savedBook]);
      setNewBook({ title: "", author: "", totalPages: "" });
      setShowAdd(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add book");
    } finally {
      setIsAdding(false);
    }
  };

  // DELETE BOOK – NOW FIXED
  const handleDeleteBook = async () => {
    if (!deleteConfirm) return;

    const { bookId, bookTitle } = deleteConfirm;
    setDeletingBook((prev) => ({ ...prev, [bookId]: true }));

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete book");
      }

      const result = await res.json();
      console.log("Book deleted:", result);

      // Optimistically remove from UI
      setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookId));

      // Trigger parent refresh (SWR, useEffect, server component, etc.)
      if (onRefresh) {
        await onRefresh(); // This is the key fix
      } else if (onSessionsUpdate) {
        onSessionsUpdate();
      }

      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        `Failed to delete "${bookTitle}": ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      // Revert optimistic update on error
      // (optional: you could refetch here too)
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
    const originalBook = books.find((b) => b.id === bookId);
    if (!originalBook) return;

    // Optimistic update
    updateBook({ id: bookId, status: newStatus });

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      updateBook(updated);
    } catch (err) {
      // Revert on error
      updateBook({ id: bookId, status: originalBook.status });
      alert("Failed to update status");
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
        body: JSON.stringify({ bookId, pagesRead: pages }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { book: updatedBook } = await res.json();
      updateBook(updatedBook);
      setLogPages((prev) => ({ ...prev, [bookId]: 0 }));

      if (onSessionsUpdate) onSessionsUpdate();
      if (isCompleted) {
        alert(`Congratulations! You finished "${book.title}"!`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to log pages");
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
      if (!res.ok) throw new Error("Failed to save rating");
      const updated = await res.json();
      updateBook(updated);
    } catch (err) {
      alert("Failed to save rating");
    }
  };

  // FILTERING
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
      {/* Delete Confirmation Modal */}
      {deleteConfirm?.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-[#5D6939] mb-2">
                  Delete Book?
                </h3>
                <p className="text-sm text-[#5D6939]/70 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold">"{deleteConfirm.bookTitle}"</span>
                  ? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deletingBook[deleteConfirm.bookId]}
                className="flex-1 px-4 py-3 bg-[#FAF2E5] text-[#5D6939] rounded-xl font-bold hover:bg-[#DBDAAE] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                disabled={deletingBook[deleteConfirm.bookId]}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingBook[deleteConfirm.bookId] ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#5D6939] to-[#AAB97E] rounded-xl">
            <Book className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-[#5D6939]">My Library</h3>
            <p className="text-sm text-[#AAB97E]">{books.length} books</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#5D6939] text-white px-5 py-3 rounded-xl hover:bg-[#4a552d] flex items-center gap-2 font-bold shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All Books", icon: Book },
          { key: "reading", label: "Reading", icon: BookOpen },
          { key: "to-read", label: "Want to Read", icon: BookMarked },
          { key: "completed", label: "Finished", icon: CheckCircle },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                filterStatus === f.key
                  ? "bg-[#5D6939] text-white"
                  : "bg-[#FAF2E5] text-[#5D6939] hover:bg-[#DBDAAE]/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {f.label} ({statusCounts[f.key as keyof typeof statusCounts]})
            </button>
          );
        })}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-[#FAF2E5] rounded-xl p-6 mb-6 border-2 border-[#DBDAAE]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-[#5D6939]">Add New Book</h4>
            <button onClick={() => setShowAdd(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] outline-none"
              disabled={isAdding}
            />
            <input
              placeholder="Author"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] outline-none"
              disabled={isAdding}
            />
            <input
              type="number"
              placeholder="Total Pages"
              value={newBook.totalPages}
              onChange={(e) =>
                setNewBook({ ...newBook, totalPages: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-[#DBDAAE] rounded-lg focus:border-[#5D6939] outline-none"
              disabled={isAdding}
            />
            <button
              onClick={handleAddBook}
              disabled={isAdding}
              className="w-full bg-[#5D6939] text-white py-3 rounded-xl font-bold hover:bg-[#4a552d] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAdding ? <Loader2 className="animate-spin" /> : null}
              {isAdding ? "Adding..." : "Add to Library"}
            </button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF2E5] rounded-xl border-2 border-dashed border-[#DBDAAE]">
          <Book className="w-16 h-16 mx-auto mb-4 text-[#AAB97E]" />
          <p className="text-[#5D6939]/70 font-medium">
            {filterStatus === "all"
              ? "No books yet!"
              : `No ${filterStatus} books`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const progress = Math.round(
              (book.currentPage / book.totalPages) * 100
            );
            const rating = book.rating || 0;

            return (
              <div
                key={book.id}
                className="bg-gradient-to-br from-white to-[#FAF2E5] rounded-xl p-5 shadow-md border-2 border-[#DBDAAE] hover:shadow-xl transition-all relative"
              >
                <button
                  onClick={() =>
                    setDeleteConfirm({
                      show: true,
                      bookId: book.id,
                      bookTitle: book.title,
                    })
                  }
                  disabled={deletingBook[book.id]}
                  className="absolute top-3 right-3 p-2 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
                >
                  {deletingBook[book.id] ? (
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </button>

                <div className="mb-3 pr-8">
                  <h4 className="font-bold text-lg text-[#5D6939] truncate">
                    {book.title}
                  </h4>
                  <p className="text-sm italic text-[#AAB97E] truncate">
                    {book.author}
                  </p>
                </div>

                {rating > 0 && (
                  <div className="flex items-center gap-1 absolute top-3 left-12 bg-yellow-50 px-2 py-1 rounded border border-yellow-300">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-yellow-700">{rating}</span>
                  </div>
                )}

                <div className="text-sm mb-2">
                  <span className="text-[#5D6939]/70">
                    {book.currentPage} / {book.totalPages}
                  </span>
                  <span className="float-right font-black text-[#5D6939]">
                    {progress}%
                  </span>
                </div>

                <div className="w-full bg-[#DBDAAE]/30 rounded-full h-3 mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[#AAB97E] to-[#5D6939] rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <select
                  value={book.status}
                  onChange={(e) =>
                    handleStatusChange(book.id, e.target.value as any)
                  }
                  disabled={updatingStatus[book.id]}
                  className="w-full mb-3 px-3 py-2 border-2 border-[#DBDAAE] rounded-lg bg-white text-sm font-medium"
                >
                  <option value="to-read">Want to Read</option>
                  <option value="reading">Currently Reading</option>
                  <option value="completed">Finished</option>
                </select>

                {book.status === "reading" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Pages"
                      className="flex-1 px-3 py-2 border-2 border-[#DBDAAE] rounded-lg text-sm"
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
                      className="bg-[#5D6939] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#4a552d] disabled:opacity-50"
                    >
                      {loggingPages[book.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Log"
                      )}
                    </button>
                  </div>
                )}

                {book.status === "completed" && rating === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
                    <p className="font-bold text-sm mb-2">Rate this book:</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRating(book.id, r)}
                        >
                          <Star className="w-7 h-7 text-yellow-400 hover:fill-yellow-500 hover:text-yellow-500 transition" />
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
