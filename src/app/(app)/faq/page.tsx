// src/app/faq/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  Search,
  BookOpen,
  Target,
  Clock,
  Download,
  TrendingUp,
  Settings,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
  icon: any;
}

const faqs: FAQ[] = [
  {
    question: "How do I get started with Lireon?",
    answer:
      "Getting started is easy! Simply sign up for an account, add your first book to your library, and start using the reading timer to track your sessions. Your progress will be automatically saved and synced across all your devices.",
    category: "Getting Started",
    icon: BookOpen,
  },
  {
    question: "How do I set my reading goals?",
    answer:
      "Navigate to your dashboard and click on the 'Goals' tab in the Progress section. You can set daily, weekly, and monthly page goals. Lireon will track your progress and help you stay on target with visual indicators and notifications.",
    category: "Goals",
    icon: Target,
  },
  {
    question: "Can I track multiple books at the same time?",
    answer:
      "Absolutely! You can add unlimited books to your reading list. Track progress for each book individually, switch between books during reading sessions, and view detailed statistics for your entire library.",
    category: "Reading",
    icon: BookOpen,
  },
  {
    question: "How does the reading timer work?",
    answer:
      "The timer is simple to use - just click 'Start' when you begin reading and 'Stop' when you're done. You can choose from preset times (10, 25, 45 minutes) or set a custom duration. All sessions are automatically logged with timestamps and page counts.",
    category: "Features",
    icon: Clock,
  },
  {
    question: "What is a reading streak and how do I maintain it?",
    answer:
      "A reading streak counts consecutive days you've logged reading sessions. Read at least one session each day to maintain your streak. The streak resets if you miss a day, but don't worry - you can always start fresh!",
    category: "Streaks",
    icon: TrendingUp,
  },
  {
    question: "Is the printable tracker free?",
    answer:
      "Yes! The PDF reading tracker is completely free to download. You can print it as many times as you need. Just click the 'Download PDF' button in the sidebar to get your printable tracker.",
    category: "Free Resources",
    icon: Download,
  },
  {
    question: "Can I edit or delete reading sessions?",
    answer:
      "Currently, reading sessions are automatically logged and cannot be edited to maintain accuracy. However, we're working on adding edit capabilities in a future update. Stay tuned!",
    category: "Features",
    icon: Settings,
  },
  {
    question: "How is my reading data stored?",
    answer:
      "All your reading data is securely stored in our database and automatically synced across your devices. We use industry-standard encryption to protect your information. Your data belongs to you and can be exported anytime.",
    category: "Privacy",
    icon: Settings,
  },
  {
    question: "What happens if I miss a day in my streak?",
    answer:
      "If you miss a day, your streak will reset to 0. But don't get discouraged! Reading is a journey, and every day is a new opportunity to build a better habit. Start fresh and aim for an even longer streak!",
    category: "Streaks",
    icon: TrendingUp,
  },
  {
    question: "Can I use Lireon offline?",
    answer:
      "While Lireon requires an internet connection for syncing data, we're working on offline mode functionality. Once implemented, you'll be able to track reading sessions offline and sync when you're back online.",
    category: "Technical",
    icon: Settings,
  },
];

const categories = [
  "All",
  ...Array.from(new Set(faqs.map((faq) => faq.category))),
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF2E5] via-[#FAF2E5] to-[#DBDAAE]/20 py-12 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-12 text-center"
      >
        <div className="inline-block p-4 bg-gradient-to-r from-[#5D6939] to-[#7A8450] rounded-2xl mb-6">
          <HelpCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#5D6939] mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600">
          Got questions? We've got answers! Find everything you need to know
          about Lireon.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#DBDAAE] bg-white focus:border-[#5D6939] focus:outline-none text-gray-700 placeholder-gray-400 shadow-sm"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-3"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-[#5D6939] text-white shadow-lg scale-105"
                  : "bg-white text-[#5D6939] border-2 border-[#DBDAAE] hover:border-[#5D6939]"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#DBDAAE]">
              <p className="text-gray-500 text-lg">
                No questions found. Try a different search term.
              </p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-[#DBDAAE] rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-5 text-left hover:bg-[#FAF2E5]/50 transition-colors flex justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-[#5D6939]/10 rounded-lg flex-shrink-0">
                      <faq.icon className="w-5 h-5 text-[#5D6939]" />
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-[#5D6939] text-lg block">
                        {faq.question}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-[#5D6939]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-5 bg-gradient-to-r from-[#FAF2E5]/50 to-[#DBDAAE]/10 border-t-2 border-[#DBDAAE]">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Still Have Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-[#5D6939] to-[#7A8450] rounded-2xl p-8 text-center text-white shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
          <p className="text-white/90 mb-6">
            Can't find what you're looking for? Reach out to our support team!
          </p>
          <a
            href="https://www.facebook.com/profile.php?id=61584529562853"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#5D6939] px-8 py-3 rounded-full font-bold hover:bg-[#FAF2E5] transition-all hover:scale-105 shadow-lg"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
