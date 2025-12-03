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
  Edit2,
  Check,
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

  // Edit state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    totalPages: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

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

  // Start editing
  const startEdit = (book: BookType) => {
    setEditingBookId(book.id);
    setEditForm({
      title: book.title,
      author: book.author,
      totalPages: book.totalPages.toString(),
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingBookId(null);
    setEditForm({ title: "", author: "", totalPages: "" });
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingBookId) return;

    const title = editForm.title.trim();
    const author = editForm.author.trim();
    const totalPages = Number(editForm.totalPages);

    if (!title || !author || totalPages <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/books/${editingBookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, totalPages }),
      });

      if (!res.ok) throw new Error("Failed to update book");

      const updatedBook: BookType = await res.json();

      setBooks(books.map((b) => (b.id === editingBookId ? updatedBook : b)));
      updateBook(updatedBook);

      cancelEdit();
      await onRefresh?.();
    } catch (err) {
      alert("Failed to update book");
    } finally {
      setSavingEdit(false);
    }
  };

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

      if (onSessionsUpdate) await onSessionsUpdate();

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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
              filterStatus === key
                ? "bg-[#5D6939] text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
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
        <div className="bg-stone-50 rounded-xl p-6 mb-6 border border-stone-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-lg text-stone-800">
              Add New Book
            </h4>
            <button
              onClick={() => setShowAdd(false)}
              className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          <div className="space-y-4">
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
              {isAdding && <Loader2 className="animate-spin w-5 h-5" />}
              {isAdding ? "Adding..." : "Add to Library"}
            </button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
          <Library className="w-12 h-12 mx-auto mb-4 text-stone-300" />
          <p className="text-stone-500 font-medium">
            {filterStatus === "all"
              ? "No books yet. Add your first book!"
              : `No ${filterStatus.replace("-", " ")} books`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const progress = Math.round(
              (book.currentPage / book.totalPages) * 100
            );
            const rating = book.rating || 0;
            const isEditing = editingBookId === book.id;

            return (
              <div
                key={book.id}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all duration-300 relative overflow-hidden"
              >
                {/* Title Row with Edit/Save Buttons */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        className="w-full font-semibold text-lg text-stone-800 bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none"
                        autoFocus
                      />
                    ) : (
                      <h4 className="font-semibold text-lg text-stone-800 leading-tight line-clamp-2">
                        {book.title}
                      </h4>
                    )}
                  </div>

                  {/* Edit / Save / Cancel Buttons - Responsive */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit}
                          className="p-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {savingEdit ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-all active:scale-95"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(book)}
                          className="p-2 text-stone-500 hover:text-[#5D6939] hover:bg-stone-100 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              show: true,
                              bookId: book.id,
                              bookTitle: book.title,
                            })
                          }
                          disabled={!!deletingBook[book.id]}
                          className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                        >
                          {deletingBook[book.id] ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Author */}
                {isEditing ? (
                  <input
                    value={editForm.author}
                    onChange={(e) =>
                      setEditForm({ ...editForm, author: e.target.value })
                    }
                    className="text-sm text-stone-600 mb-3 w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none"
                    placeholder="Author"
                  />
                ) : (
                  <p className="text-sm text-stone-500 mb-3">
                    by {book.author}
                  </p>
                )}

                {/* Rating */}
                {rating > 0 && !isEditing && (
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating bookId={book.id} currentRating={rating} />
                    <span className="text-xs text-stone-500">{rating}/5</span>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-stone-600">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.totalPages}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              totalPages: e.target.value,
                            })
                          }
                          className="w-20 px-2 py-1 text-sm border border-stone-300 rounded bg-white focus:border-[#5D6939] outline-none"
                        />
                      ) : (
                        `${book.currentPage} / ${book.totalPages} pages`
                      )}
                    </span>
                    <span className="font-bold text-[#5D6939]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#AAB97E] to-[#5D6939] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Select */}
                <div className="relative mb-4">
                  <select
                    value={book.status}
                    onChange={(e) =>
                      handleStatusChange(
                        book.id,
                        e.target.value as BookType["status"]
                      )
                    }
                    disabled={updatingStatus[book.id] || isEditing}
                    className="w-full px-4 py-3 pr-10 border-2 border-[#DBDAAE] rounded-xl bg-[#FAF2E5] text-sm font-bold text-[#5D6939] appearance-none cursor-pointer hover:border-[#AAB97E] focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none transition-all disabled:opacity-50"
                  >
                    <option value="to-read">Want to Read</option>
                    <option value="reading">Currently Reading</option>
                    <option value="completed">Finished</option>
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

                {/* Log Pages */}
                {book.status === "reading" && !isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Pages read today"
                      className="flex-1 px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:border-[#5D6939] focus:ring-2 focus:ring-[#5D6939]/20 outline-none"
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
                      className="bg-[#5D6939] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#4a552d] disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
                    >
                      {loggingPages[book.id] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Log"
                      )}
                    </button>
                  </div>
                )}

                {/* Rating Prompt */}
                {book.status === "completed" && rating === 0 && !isEditing && (
                  <div className="mt-4 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-center font-medium text-sm text-amber-900 mb-3">
                      How was this book?
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
