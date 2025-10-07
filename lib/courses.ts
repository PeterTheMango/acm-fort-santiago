export type Course = {
  slug: string;
  title: string;
  description: string;
  author: string;
  bannerUrl: string;
  totalLessons: number;
};

export type EnrolledCourse = Course & {
  completedLessons: number;
};

// Unsplash placeholders with consistent sizing
const placeholders = {
  web: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1600&auto=format&fit=crop",
  ai: "https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?q=80&w=1600&auto=format&fit=crop",
  security: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1600&auto=format&fit=crop",
  data: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop",
  git: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1600&auto=format&fit=crop",
};

export const browseCourses: Course[] = [
  {
    slug: "web-development-basics",
    title: "Web Development Basics",
    description: "Learn HTML, CSS, and JavaScript fundamentals to build modern websites.",
    author: "ACM Mentors",
    bannerUrl: placeholders.web,
    totalLessons: 24,
  },
  {
    slug: "intro-to-machine-learning",
    title: "Intro to Machine Learning",
    description: "Understand core ML concepts and build your first models with Python.",
    author: "ACM AI",
    bannerUrl: placeholders.ai,
    totalLessons: 18,
  },
  {
    slug: "cybersecurity-essentials",
    title: "Cybersecurity Essentials",
    description: "Protect systems and data with security principles and practical labs.",
    author: "ACM Security",
    bannerUrl: placeholders.security,
    totalLessons: 20,
  },
  {
    slug: "data-structures-algorithms",
    title: "Data Structures & Algorithms",
    description: "Master problem solving with common data structures and algorithms.",
    author: "ACM CS",
    bannerUrl: placeholders.data,
    totalLessons: 30,
  },
];

export const yourCourses: EnrolledCourse[] = [
  {
    slug: "web-development-basics",
    title: "Web Development Basics",
    description: "Learn HTML, CSS, and JavaScript fundamentals to build modern websites.",
    author: "ACM Mentors",
    bannerUrl: placeholders.web,
    totalLessons: 24,
    completedLessons: 9,
  },
  {
    slug: "intro-to-machine-learning",
    title: "Intro to Machine Learning",
    description: "Understand core ML concepts and build your first models with Python.",
    author: "ACM AI",
    bannerUrl: placeholders.ai,
    totalLessons: 18,
    completedLessons: 5,
  },
  {
    slug: "cybersecurity-essentials",
    title: "Cybersecurity Essentials",
    description: "Protect systems and data with security principles and practical labs.",
    author: "ACM Security",
    bannerUrl: placeholders.security,
    totalLessons: 20,
    completedLessons: 12,
  },
];


