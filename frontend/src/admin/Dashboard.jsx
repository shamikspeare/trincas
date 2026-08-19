// src/admin/Dashboard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Armchair,
  UtensilsCrossed,
  Music2,
  Landmark,
  Newspaper,
  Rainbow,
  Star,
  ArrowRight,
  Users,
  Eye,
  Clock,
} from "lucide-react";

const sections = [
  {
    title: "Dining",
    description: "Manage dining experience, ambiance, and related content",
    icon: Armchair,
    href: "/admin/dining",
    from: "from-amber-100",
    to: "to-orange-50",
    iconColor: "text-amber-700",
  },
  {
    title: "Food & Beverages",
    description: "Manage menu, dishes, drinks and descriptions",
    icon: UtensilsCrossed,
    href: "/admin/food",
    from: "from-emerald-100",
    to: "to-green-50",
    iconColor: "text-emerald-700",
  },
  {
    title: "Music",
    description: "Manage artists, live music events and music history",
    icon: Music2,
    href: "/admin/music",
    from: "from-violet-100",
    to: "to-purple-50",
    iconColor: "text-violet-700",
  },
  {
    title: "History",
    description: "Manage Trinca's rich history and milestones",
    icon: Landmark,
    href: "/admin/history",
    from: "from-sky-100",
    to: "to-blue-50",
    iconColor: "text-sky-700",
  },
  {
    title: "Press",
    description: "Manage articles, features and press coverage",
    icon: Newspaper,
    href: "/admin/press",
    from: "from-rose-100",
    to: "to-pink-50",
    iconColor: "text-rose-700",
  },
  {
    title: "LGBTQ+",
    description: "Manage LGBTQ+ heritage, stories and initiatives",
    icon: Rainbow,
    href: "/admin/lgbtq",
    from: "from-fuchsia-100",
    to: "to-indigo-50",
    iconColor: "text-fuchsia-600",
  },
  {
    title: "Reviews",
    description: "Manage customer reviews and testimonials",
    icon: Star,
    href: "/admin/reviews",
    from: "from-amber-100",
    to: "to-yellow-50",
    iconColor: "text-amber-600",
  },
];

const stats = [
  { label: "Total Visitors", value: "12,458", icon: Users },
  { label: "Page Views", value: "28,756", icon: Eye },
  { label: "Avg. Session Time", value: "03:24", icon: Clock },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900" style={{fontSize: '3em'}}>
          Welcome back, Admin 👋
        </h1>
        <p className="mt-1 text-gray-500" style={{fontSize: '3em'}}>
          Manage your website content and monitor performance.
        </p>
      </div>

      <div className="mt-8 border-t border-gray-100" />

      {/* Section cards */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Manage Sections
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Click on any section to manage its content
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  to={section.href}
                  className={`group flex h-full flex-col rounded-2xl bg-gradient-to-br ${section.from} ${section.to} p-6 transition-shadow hover:shadow-md`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 shadow-sm">
                    <Icon className={`h-5 w-5 ${section.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <p className="mt-1 text-sm leading-snug text-gray-600">
                    {section.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900">
                    Manage
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}