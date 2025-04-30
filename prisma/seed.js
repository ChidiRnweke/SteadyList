import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create a mock user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      id: 'user-1',
      name: 'Demo User',
      email: 'user@example.com',
      image: 'https://ui-avatars.com/api/?name=Demo+User',
    },
  });

  console.log('Created user:', user);

  // Create mock projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Work Tasks',
      description: 'All tasks related to my job',
      userId: user.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Personal',
      description: 'My personal to-do list',
      userId: user.id,
    },
  });

  console.log('Created projects');

  // Create mock tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Finish presentation',
      description: 'Complete slides for team meeting',
      priority: 'high',
      status: 'in-progress',
      reminder: true,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      projectId: project1.id,
      userId: user.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Buy groceries',
      description: 'Get milk, eggs, and bread',
      priority: 'medium',
      status: 'todo',
      projectId: project2.id,
      userId: user.id,
    },
  });

  console.log('Created tasks');

  // Create mock notes
  await prisma.note.create({
    data: {
      title: 'Meeting notes',
      content: 'Discussed quarterly goals and upcoming projects',
      projectId: project1.id,
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: 'Shopping list',
      content: 'Eggs\nMilk\nBread\nApples',
      projectId: project2.id,
      userId: user.id,
    },
  });

  console.log('Created notes');

  // Create mock notifications
  await prisma.notification.create({
    data: {
      title: 'Task Due Soon',
      message: 'Finish presentation is due tomorrow',
      taskId: task1.id,
      projectId: project1.id,
      userId: user.id,
    },
  });

  console.log('Created notifications');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 