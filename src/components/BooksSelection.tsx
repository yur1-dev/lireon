"use client";

import { useState } from "react";
import {
  Plus,
  Loader2,
  X,
  Star,
  Trash2,
  AlertTriangle,
  BookOpen,
  BookMarked,
  CheckCircle,
  Library,
} from "lucide-react";

export interface BookType {
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
  const [logPages, setLogPages] = useState<Record<string, number>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [loggingPages, setLoggingPages] = useState<Record<string, boolean>>({});
  const [deletingBook, setDeletingBook] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<
    "all" | "to-read" | "reading" | "completed"
  >("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    bookId: string;
    bookTitle: string;
  } | null>(null);
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});

  // ADD BOOK
  const handleAddBook = async () => {
    const title = newBook.title.trim();
    const author = newBook.author.trim();
    const totalPages = Number(newBook.totalPages);
    if (!title || !author || totalPages <= 0)
      return alert("Please fill all fields correctly");

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
    } catch {
      alert("Failed to add book");
    } finally {
      setIsAdding(false);
    }
  };

  // DELETE BOOK
  const handleDeleteBook = async () => {
    if (!deleteConfirm) return;
    const { bookId } = deleteConfirm;

    setDeletingBook((prev) => ({ ...prev, [bookId]: true }));
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");
      setBooks(books.filter((b) => b.id !== bookId));
      await onRefresh?.();
      setDeleteConfirm(null);
    } catch {
      alert("Failed to delete book");
    } finally {
      setDeletingBook((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // STATUS CHANGE
  const handleStatusChange = async (
    bookId: string,
    newStatus: BookType["status"]
  ) => {
    setUpdatingStatus((prev) => ({ ...prev, [bookId]: true }));
    const oldBook = books.find((b) => b.id === bookId);
    if (!oldBook) return;

    updateBook({ id: bookId, status: newStatus });

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updatedBook = await res.json();
      updateBook({ id: bookId, ...updatedBook });
    } catch {
      updateBook({ id: bookId, status: oldBook.status });
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

    setLoggingPages((prev) => ({ ...prev, [bookId]: true }));
    try {
      const res = await fetch("/api/reading-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, pagesRead: pages }),
      });
      if (!res.ok) throw new Error("Failed to log pages");
      const responseData = await res.json();
      const updatedBook = responseData.book;

      setLogPages((prev) => {
        const newState = { ...prev };
        delete newState[bookId];
        return newState;
      });

      if (onSessionsUpdate) {
        await onSessionsUpdate();
      }

      updateBook({
        id: book.id,
        currentPage: updatedBook.currentPage,
        totalPages: updatedBook.totalPages,
        status: updatedBook.status,
        updatedAt: updatedBook.updatedAt,
      });
    } catch (error) {
      console.error("Failed to log pages:", error);
      alert("Failed to log pages");
    } finally {
      setLoggingPages((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // RATING
  const handleRating = async (bookId: string, rating: number) => {
    updateBook({ id: bookId, rating });

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error();
      const updatedBook = await res.json();
      updateBook({ id: bookId, ...updatedBook });
    } catch {
      updateBook({ id: bookId, rating: 0 });
      alert("Failed to save rating");
    }
  };

  const statusPriority: Record<BookType["status"], number> = {
    reading: 0,
    "to-read": 1,
    completed: 2,
  };

  const sortedBooks = [...books].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );

  const filteredBooks =
    filterStatus === "all"
      ? sortedBooks
      : books.filter((b) => b.status === filterStatus);

  const statusCounts = {
    all: books.length,
    "to-read": books.filter((b) => b.status === "to-read").length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
  } satisfies Record<"all" | "to-read" | "reading" | "completed", number>;

  const StarRating = ({
    bookId,
    currentRating,
    interactive = false,
  }: {
    bookId: string;
    currentRating: number;
    interactive?: boolean;
  }) => {
    const displayRating = hoverRating[bookId] ?? currentRating;

    return (
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => {
          if (interactive) {
            setHoverRating((prev) => {
              const newState = { ...prev };
              delete newState[bookId];
              return newState;
            });
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && handleRating(bookId, star)}
            onMouseEnter={() =>
              interactive &&
              setHoverRating((prev) => ({ ...prev, [bookId]: star }))
            }
            disabled={!interactive}
            className={`transition-transform duration-150 ease-out ${
              interactive ? "hover:scale-125 cursor-pointer" : "cursor-default"
            }`}
          >
            <Star
              className={`w-5 h-5 transition-all duration-150 ease-out ${
                star <= displayRating
                  ? "text-amber-400 fill-amber-400"
                  : interactive
                  ? "text-stone-300 hover:text-amber-300"
                  : "text-stone-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-stone-200 lg:col-span-3">
      {/* Delete Modal */}
      {deleteConfirm?.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-stone-800">
                  Delete Book?
                </h3>
                <p className="text-sm text-stone-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-stone-700">
                    {deleteConfirm.bookTitle}
                  </strong>
                  ?
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                disabled={deletingBook[deleteConfirm.bookId]}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-700 transition-colors"
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#5D6939] to-[#7a8a4a] rounded-xl shadow-sm">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-stone-800">My Library</h3>
            <p className="text-sm text-stone-500">{books.length} books total</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-[#5D6939] text-white px-5 py-2.5 rounded-xl hover:bg-[#4a552d] flex items-center gap-2 font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "all" as const, label: "All", icon: Library },
          { key: "reading" as const, label: "Reading", icon: BookOpen },
          { key: "to-read" as const, label: "To Read", icon: BookMarked },
          { key: "completed" as const, label: "Finished", icon: CheckCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filterStatus === key
                ? "bg-[#5D6939] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filterStatus === key ? "bg-white/20" : "bg-stone-200"
              }`}
            >
              {statusCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Add Book Form */}
      {showAdd && (
        <div className="bg-stone-50 rounded-xl p-6 mb-6 border border-stone-200 animate-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg text-stone-800">
              Add New Book
            </h4>
            <button
              onClick={() => setShowAdd(false)}
              className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Book title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all bg-white"
              disabled={isAdding}
            />
            <input
              placeholder="Author name"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all bg-white"
              disabled={isAdding}
            />
            <input
              type="number"
              placeholder="Total pages"
              value={newBook.totalPages}
              onChange={(e) =>
                setNewBook({ ...newBook, totalPages: e.target.value })
              }
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all bg-white"
              disabled={isAdding}
            />
            <button
              onClick={handleAddBook}
              disabled={isAdding}
              className="w-full bg-[#5D6939] text-white py-3 rounded-xl font-semibold hover:bg-[#4a552d] disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isAdding && <Loader2 className="animate-spin w-4 h-4" />}
              {isAdding ? "Adding..." : "Add to Library"}
            </button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
          <Library className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p className="text-stone-500 font-medium">
            {filterStatus === "all"
              ? "No books yet. Add your first book!"
              : `No ${filterStatus.replace("-", " ")} books`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => {
            const progress = Math.round(
              (book.currentPage / book.totalPages) * 100
            );
            const rating = book.rating || 0;

            return (
              <div
                key={book.id}
                className="group bg-white rounded-xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-stone-300 transition-all duration-200"
              >
                {/* Header with title and delete */}
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h4 className="font-semibold text-lg text-stone-800 leading-tight line-clamp-2 flex-1">
                    {book.title}
                  </h4>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        show: true,
                        bookId: book.id,
                        bookTitle: book.title,
                      })
                    }
                    disabled={!!deletingBook[book.id]}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 shrink-0 -mt-1 -mr-1"
                  >
                    {deletingBook[book.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Author */}
                <p className="text-sm text-stone-500 mb-3">by {book.author}</p>

                {rating > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-500">{rating}/5</span>
                  </div>
                )}

                {/* Progress section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-stone-500">
                      {book.currentPage} of {book.totalPages} pages
                    </span>
                    <span className="font-semibold text-[#5D6939]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#AAB97E] to-[#5D6939] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="relative mb-3">
                  <select
                    value={book.status}
                    onChange={(e) =>
                      handleStatusChange(
                        book.id,
                        e.target.value as BookType["status"]
                      )
                    }
                    disabled={updatingStatus[book.id]}
                    className="w-full px-4 py-2.5 pr-10 border-2 border-[#DBDAAE] rounded-xl bg-[#FAF2E5] text-sm font-semibold text-[#5D6939] appearance-none cursor-pointer hover:border-[#AAB97E] hover:bg-[#f5ebda] focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option
                      value="to-read"
                      className="bg-white text-[#5D6939] cursor-pointer"
                    >
                      Want to Read
                    </option>
                    <option
                      value="reading"
                      className="bg-white text-[#5D6939] cursor-pointer"
                    >
                      Currently Reading
                    </option>
                    <option
                      value="completed"
                      className="bg-white text-[#5D6939] cursor-pointer"
                    >
                      Finished
                    </option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D6939]">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Log pages - for reading books */}
                {book.status === "reading" && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Pages read"
                      className="flex-1 px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all"
                      value={logPages[book.id] ?? ""}
                      onChange={(e) =>
                        setLogPages({
                          ...logPages,
                          [book.id]: Number(e.target.value) || 0,
                        })
                      }
                      disabled={loggingPages[book.id]}
                    />
                    <button
                      onClick={() => handleLogPages(book.id)}
                      disabled={loggingPages[book.id]}
                      className="bg-[#5D6939] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#4a552d] disabled:opacity-50 transition-all active:scale-[0.97] shrink-0"
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
                  <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
                    <p className="font-medium text-sm text-stone-600 mb-3 text-center">
                      Rate this book
                    </p>
                    <div className="flex justify-center">
                      <StarRating
                        bookId={book.id}
                        currentRating={0}
                        interactive
                      />
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
