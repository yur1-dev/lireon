// src/app/objectives/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Target,
  BookHeart,
  Smartphone,
  TrendingUp,
  Award,
  Users,
  Zap,
  LineChart,
  Check,
  BookOpen, // Added for the button icon
} from "lucide-react";
import { useRouter } from "next/navigation"; // Added this

const objectives = [
  {
    title: "Build a Reading Habit",
    description:
      "Help users establish a consistent daily reading routine through intuitive tracking and personalized goal-setting.",
    icon: BookHeart,
    color: "from-blue-500 to-blue-600",
    bgColor: "from-blue-50 to-blue-100",
  },
  {
    title: "Reduce Screen Time",
    description:
      "Replace mindless scrolling with meaningful reading - for academics, productivity, and genuine entertainment.",
    icon: Smartphone,
    color: "from-purple-500 to-purple-600",
    bgColor: "from-purple-50 to-purple-100",
  },
  {
    title: "Track Progress",
    description:
      "Visualize your reading journey with comprehensive stats, daily streaks, and personalized achievements.",
    icon: LineChart,
    color: "from-green-500 to-green-600",
    bgColor: "from-green-50 to-green-100",
  },
  {
    title: "Stay Motivated",
    description:
      "Keep your reading momentum going with gamified goals, streak tracking, and beautiful progress visualization.",
    icon: Zap,
    color: "from-amber-500 to-amber-600",
    bgColor: "from-amber-50 to-amber-100",
  },
  {
    title: "Celebrate Achievements",
    description:
      "Unlock milestones, earn badges, and celebrate every page turned on your literary journey.",
    icon: Award,
    color: "from-orange-500 to-orange-600",
    bgColor: "from-orange-50 to-orange-100",
  },
  {
    title: "Build Community",
    description:
      "Connect with fellow readers, share progress, and inspire others on their reading journey.",
    icon: Users,
    color: "from-pink-500 to-pink-600",
    bgColor: "from-pink-50 to-pink-100",
  },
];

const vision = [
  "Make reading accessible and enjoyable for everyone",
  "Create a supportive community of lifelong learners",
  "Transform screen time into growth time",
  "Help users read more books than ever before",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
} as const;

export default function ObjectivesPage() {
  const router = useRouter(); // Added

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF2E5] via-[#FAF2E5] to-[#DBDAAE]/20">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#5D6939] to-[#7A8450] text-white py-20 px-4"
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20">
              <Target className="w-16 h-16" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Our Objectives
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Building a world where reading is a daily habit, not a distant dream
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 border-4 border-white rotate-45"></div>
        </div>
      </motion.section>

      {/* Main Objectives Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {objectives.map((obj, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, translateY: -8 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-[#DBDAAE] hover:border-[#5D6939] transition-all relative overflow-hidden group"
            >
              {/* Background Gradient */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${obj.bgColor} rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-70 transition-opacity`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`inline-flex p-4 bg-gradient-to-br ${obj.color} rounded-2xl mb-4 shadow-lg`}
                >
                  <obj.icon className="w-8 h-8 text-white" />
                </div>

                {/* Number Badge */}
                <div className="absolute top-0 right-0 w-10 h-10 bg-[#5D6939] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-[#5D6939] mb-3">
                  {obj.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {obj.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Vision Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-[#DBDAAE]"
        >
          <div className="text-center mb-10">
            <div className="inline-block p-3 bg-gradient-to-br from-[#5D6939] to-[#7A8450] rounded-2xl mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#5D6939] mb-3">
              Our Vision
            </h2>
            <p className="text-lg text-gray-600">
              What we're working towards every single day
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {vision.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FAF2E5]/50 to-[#DBDAAE]/20 border-2 border-[#DBDAAE]/50 hover:border-[#5D6939]/50 transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#5D6939] to-[#7A8450] rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="text-gray-700 font-medium pt-1">{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { number: "10K+", label: "Active Readers" },
            { number: "500K+", label: "Pages Tracked" },
            { number: "15K+", label: "Books Logged" },
            { number: "95%", label: "User Satisfaction" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-white to-[#FAF2E5] rounded-2xl p-6 text-center shadow-lg border-2 border-[#DBDAAE]"
            >
              <div className="text-3xl md:text-4xl font-bold text-[#5D6939] mb-2">
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section - NOW WORKING */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 py-16 mb-16"
      >
        <div className="bg-gradient-to-r from-[#5D6939] to-[#7A8450] rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <TrendingUp className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Reading?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of readers who are building better habits with
              Lireon
            </p>

            {/* Fixed Button with Navigation */}
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white text-[#5D6939] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FAF2E5] transition-all hover:scale-105 shadow-lg inline-flex items-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              Start Reading Today
            </button>
          </div>

          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
