import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: UserRole.admin,
      bio: 'System Administrator',
    },
  });

  // Create trainer user
  const trainerPassword = await bcrypt.hash('Trainer123!', 10);
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Trainer',
      email: 'trainer@example.com',
      password: trainerPassword,
      role: UserRole.trainer,
      bio: 'Experienced trainer with 10+ years in software development',
      certifications: JSON.stringify([
        'Certified Scrum Master',
        'AWS Solutions Architect',
        'Docker Certified Associate'
      ]),
    },
  });

  // Create learner user
  const learnerPassword = await bcrypt.hash('Learner123!', 10);
  const learner = await prisma.user.upsert({
    where: { email: 'learner@example.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Learner',
      email: 'learner@example.com',
      password: learnerPassword,
      role: UserRole.learner,
      bio: 'Aspiring developer looking to enhance skills',
    },
  });

  // Create sample courses
  const course1 = await prisma.course.upsert({
    where: { slug: 'nestjs-fundamentals' },
    update: {},
    create: {
      title: 'NestJS Fundamentals',
      slug: 'nestjs-fundamentals',
      description: 'Learn the basics of NestJS framework for building scalable Node.js applications',
      level: 'beginner',
      price: 99.99,
      duration: '4 weeks',
      thumbnailUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: 'advanced-database-design' },
    update: {},
    create: {
      title: 'Advanced Database Design',
      slug: 'advanced-database-design',
      description: 'Master database design patterns and optimization techniques',
      level: 'advanced',
      price: 149.99,
      duration: '6 weeks',
      thumbnailUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg',
    },
  });

  // Create course contents
  await prisma.courseContent.createMany({
    data: [
      {
        courseId: course1.id,
        type: 'video',
        title: 'Introduction to NestJS',
        contentUrl: 'https://example.com/video1',
        orderIndex: 1,
      },
      {
        courseId: course1.id,
        type: 'pdf',
        title: 'NestJS Architecture Guide',
        contentUrl: 'https://example.com/pdf1',
        orderIndex: 2,
      },
      {
        courseId: course1.id,
        type: 'quiz',
        title: 'Chapter 1 Quiz',
        contentUrl: null,
        orderIndex: 3,
      },
    ],
  });

  // Create course sessions
  const session1 = await prisma.courseSession.create({
    data: {
      courseId: course1.id,
      trainerId: trainer.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-28'),
      location: 'Online - Zoom',
      status: 'planned',
    },
  });

  // Create sample enrollment
  await prisma.enrollment.create({
    data: {
      userId: learner.id,
      sessionId: session1.id,
      status: 'confirmed',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('👤 Created users:', { admin: admin.email, trainer: trainer.email, learner: learner.email });
  console.log('📚 Created courses:', { course1: course1.title, course2: course2.title });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });