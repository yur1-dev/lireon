// src/app/about/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Heart,
  Instagram,
  Facebook,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Smart Tracking",
    description: "Track your reading time and pages with precision",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and achieve daily, weekly, and monthly reading goals",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Monitor your growth with beautiful visual charts",
  },
  {
    icon: Calendar,
    title: "Streak Building",
    description: "Build consistent reading habits day by day",
  },
];

const team = [
  {
    name: "Nathania M. Manibug",
    role: "Team Leader",
    bio: "Leading the team in developing Lireon, coordinating project goals and deliverables.",
    image: "/Nathania-Manibug.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Jianne Alexa L. Pinapin",
    role: "Graphic Designer",
    bio: "Legal Management student specializing in visual design and graphics for the application.",
    image: "/Jianne-Pinapin.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Angel U. Nicolas",
    role: "Team Member",
    bio: "Legal Management student contributing to the development of Lireon as a capstone project.",
    image: "/Angel-Nicholas.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Geraldine D. Obenar",
    role: "Team Member",
    bio: "Legal Management student focused on creating intuitive and beautiful user interfaces for the project.",
    image: "/Geraldine-Obenar.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "John Paul A. Mauricio",
    role: "Team Member",
    bio: "Legal Management student handling database design and server-side logic for the application.",
    image: "/John-Paul-Mauricio.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Nerissa D. Marcaida",
    role: "Team Member",
    bio: "Legal Management student ensuring the app works smoothly and bug-free for all users.",
    image: "/Nerissa-Mercaida.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
  {
    name: "Orland Karele I. Parallag",
    role: "Team Member",
    bio: "Legal Management student managing data structures and ensuring efficient data storage and retrieval.",
    image: "/Orland-Parallag.png",
    links: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
    },
  },
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

export default function AboutPage() {
  const router = useRouter();

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
              <BookOpen className="w-16 h-16" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">About Lireon</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Your personal reading companion designed to help you build and
            maintain a consistent reading habit
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-white rotate-45"></div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border-2 border-[#DBDAAE]"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-[#5D6939]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#5D6939]">
              Our Mission
            </h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            We believe that reading is one of the most valuable habits you can
            develop. In a world full of distractions, Lireon makes it easy to
            track your reading progress, set meaningful goals, and stay
            motivated on your literary journey.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our mission is to empower readers of all levels to build lasting
            reading habits through intuitive tracking, insightful analytics, and
            a beautiful user experience that celebrates every page turned.
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#5D6939] mb-4">
            Why Choose Lireon?
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to become a better reader
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#DBDAAE] hover:border-[#5D6939] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-[#5D6939]/10 to-[#DBDAAE]/20 rounded-xl w-fit mb-4">
                <feature.icon className="w-8 h-8 text-[#5D6939]" />
              </div>
              <h3 className="text-xl font-bold text-[#5D6939] mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-[#5D6939]" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#5D6939]">
              Meet the Team
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            The passionate people behind Lireon
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#DBDAAE] hover:border-[#5D6939] transition-all"
            >
              <div className="text-center mb-3">
                <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-3 border-[#DBDAAE]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#5D6939] mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-[#5D6939]/70 mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-3 border-t-2 border-[#DBDAAE]">
                <a
                  href={member.links.facebook}
                  className="p-2 rounded-lg bg-[#5D6939]/5 hover:bg-[#5D6939]/10 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-[#5D6939]" />
                </a>
                <a
                  href={member.links.instagram}
                  className="p-2 rounded-lg bg-[#5D6939]/5 hover:bg-[#5D6939]/10 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-[#5D6939]" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-4 py-16 mb-16"
      >
        <div className="bg-gradient-to-r from-[#5D6939] to-[#7A8450] rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built with Love for Readers
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of readers who are building better reading habits
              with Lireon
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-white text-[#5D6939] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#FAF2E5] transition-all hover:scale-105 shadow-lg inline-flex items-center gap-3"
            >
              <BookOpen className="w-6 h-6" />
              Start Your Reading Journey
            </button>
          </div>

          {/* Decorative background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
