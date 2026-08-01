import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users, Mic, Palette } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';

const cards = [
  {
    title: 'Musicians',
    description: 'Profiles, performances, and community playlists.',
    icon: Mic,
    gradient: 'from-[#eef4ff] via-[#e9e2ff] to-[#f6ecff]',
  },
  {
    title: 'Health Resources',
    description: 'Supportive guidance and wellbeing references.',
    icon: Heart,
    gradient: 'from-[#eef8ef] via-[#f1f7e6] to-[#fff5df]',
  },
  {
    title: 'Organisation',
    description: 'Groups, initiatives, and community partners.',
    icon: Users,
    gradient: 'from-[#fff2e5] via-[#fdeedb] to-[#f7e7ff]',
  },
  {
    title: 'Artist',
    description: 'Creators, exhibitions, and visual culture.',
    icon: Palette,
    gradient: 'from-[#f7eef8] via-[#f3ecff] to-[#eef5ff]',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const PrideLgbtqSubPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Home', link: '/' }, { label: 'Pride', link: '/pride' }, { label: 'LGBTQ' }]} />

      <motion.div
        className="mx-auto w-full max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 text-center">
          <h1 className="font-serif text-[clamp(2.25rem,7vw,4rem)] leading-none text-[#111111]">
            LGBTQ
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            A light, community-first space for people, projects, and cultural moments.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.button
                key={card.title}
                variants={cardVariants}
                type="button"
                className={`group flex min-h-[170px] flex-col justify-between rounded-[20px] bg-gradient-to-br ${card.gradient} p-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-[#4c4c4c] shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-[1.05rem] font-semibold text-[#222]">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#444]">{card.description}</p>
                </div>

                <div className="flex items-center justify-center gap-1 text-sm font-medium text-[#222]">
                  <span>Manage</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
};

export default PrideLgbtqSubPage;
