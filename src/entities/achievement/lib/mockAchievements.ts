export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  hint: string;
  rarity: AchievementRarity;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  progressMax?: number;
}

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Звичайна',
  rare: 'Рідкісна',
  epic: 'Епічна',
  legendary: 'Легендарна',
};

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    emoji: '🧗',
    title: 'Перший крок',
    description: 'Залогував свій перший підйом.',
    hint: 'Просто залогуй підйом',
    rarity: 'common',
    earned: true,
    earnedAt: '2024-11-03',
  },
  {
    id: 'chalk_hands',
    emoji: '🤍',
    title: 'Крейдяні руки',
    description: 'Використав магнезію більше разів, ніж пив воду.',
    hint: 'Залогуй 20 підйомів',
    rarity: 'common',
    earned: true,
    earnedAt: '2024-11-15',
    progress: 20,
    progressMax: 20,
  },
  {
    id: 'wall_hugger',
    emoji: '🫂',
    title: 'Обіймач стін',
    description: 'Провів у залі більше часу, ніж вдома.',
    hint: 'Потренуйся 10 разів',
    rarity: 'common',
    earned: true,
    earnedAt: '2024-12-01',
  },
  {
    id: 'weekly_warrior',
    emoji: '🔥',
    title: 'Тижневий воїн',
    description: '5 підйомів за один тиждень. Мабуть, треба поспати.',
    hint: 'Залогуй 5 підйомів за 7 днів',
    rarity: 'rare',
    earned: true,
    earnedAt: '2024-12-10',
  },
  {
    id: 'spider_man',
    emoji: '🕷️',
    title: 'Людина-павук',
    description: 'Пройшов трасу 7-ку. Дядько Бен пишається.',
    hint: 'Залогуй підйом на трасу складності 7A+',
    rarity: 'rare',
    earned: true,
    earnedAt: '2025-01-05',
  },
  {
    id: 'route_collector',
    emoji: '🌈',
    title: 'Колекціонер кольорів',
    description: 'Підкорив траси всіх кольорів. Майже Танос, але для скель.',
    hint: 'Залогуй підйом на кожен колір трас у залі',
    rarity: 'rare',
    earned: true,
    earnedAt: '2025-01-20',
  },
  {
    id: 'never_give_up',
    emoji: '😤',
    title: 'Впертий як мул',
    description: 'Намагався пройти одну й ту саму трасу 10 разів поспіль. Трасі вже трохи соромно.',
    hint: 'Зафіксуй 10 спроб на одній трасі',
    rarity: 'epic',
    earned: true,
    earnedAt: '2025-02-14',
  },
  {
    id: 'century',
    emoji: '💯',
    title: 'Соточка',
    description: '100 підйомів. Твої пальці вже вміють читати трасу тактильно.',
    hint: 'Залогуй 100 підйомів загалом',
    rarity: 'epic',
    earned: false,
    progress: 73,
    progressMax: 100,
  },
  {
    id: 'social_climber',
    emoji: '🤝',
    title: 'Соціальний альпініст',
    description: 'Отримав 50 реакцій від спільноти. Тебе люблять!',
    hint: 'Отримай 50 реакцій на свої підйоми',
    rarity: 'rare',
    earned: false,
    progress: 31,
    progressMax: 50,
  },
  {
    id: 'night_owl',
    emoji: '🦉',
    title: 'Нічний хижак',
    description: 'Тренувався після 21:00. Зал закривається, але ти ще лізеш.',
    hint: 'Залогуй підйом після 21:00',
    rarity: 'common',
    earned: false,
  },
  {
    id: 'perfect_send',
    emoji: '✨',
    title: 'Чистий прохід',
    description: 'Пройшов трасу без єдиного зриву з першої спроби. Гравітація заплакала.',
    hint: 'Залогуй onsight підйом',
    rarity: 'epic',
    earned: false,
    progress: 0,
    progressMax: 1,
  },
  {
    id: 'five_stars',
    emoji: '⭐',
    title: 'Критик',
    description: 'Оцінив 20 трас. Мішлен вже телефонує.',
    hint: 'Залиш оцінку на 20 трасах',
    rarity: 'common',
    earned: false,
    progress: 7,
    progressMax: 20,
  },
  {
    id: 'comeback_kid',
    emoji: '🔄',
    title: 'Повернення легенди',
    description: "Повернувся після 2-тижневої перерви. М'язи в шоці.",
    hint: 'Залогуй підйом після 14+ днів паузи',
    rarity: 'rare',
    earned: false,
  },
  {
    id: 'gym_legend',
    emoji: '🏆',
    title: 'Легенда зали',
    description: '500 підйомів. Тобі вже дали ключі від залу.',
    hint: 'Залогуй 500 підйомів загалом',
    rarity: 'legendary',
    earned: false,
    progress: 73,
    progressMax: 500,
  },
  {
    id: 'overhang_king',
    emoji: '👑',
    title: 'Король нависань',
    description: 'Пройшов 30 трас з нависанням. Закони фізики — не для тебе.',
    hint: 'Залогуй 30 підйомів на трасах з нависанням',
    rarity: 'legendary',
    earned: false,
    progress: 12,
    progressMax: 30,
  },
];
