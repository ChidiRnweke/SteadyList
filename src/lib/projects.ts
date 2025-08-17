import type { Project, CreateProjectInput, UpdateProjectInput } from './types';
import prisma from './prisma';

export interface IProjectsService {
	getAllProjects(): Promise<Project[]>;
	getProjectById(id: string): Promise<Project | null>;
	createProject(data: CreateProjectInput): Promise<Project>;
	updateProject(id: string, data: UpdateProjectInput): Promise<Project | null>;
	softDeleteProject(id: string): Promise<boolean>;
	restoreProject(id: string): Promise<boolean>;
	getDeletedProjects(): Promise<Project[]>;
}

export class ProjectsService implements IProjectsService {
	constructor(private userId: string) {}

	async getAllProjects(): Promise<Project[]> {
		const projects = await prisma.project.findMany({
			where: { deleted: false, userId: this.userId },
			orderBy: { updatedAt: 'desc' },
			include: {
				_count: {
					select: {
						tasks: {
							where: {
								deleted: false
							}
						}
					}
				},
				tasks: {
					where: {
						deleted: false,
						status: 'done'
					},
					select: {
						id: true
					}
				}
			}
		});

		return projects.map((project) => ({
			...project,
			taskCount: project._count.tasks,
			completedTaskCount: project.tasks.length,
			blockedTaskCount: 0
		})) as unknown as Project[];
	}

	async getProjectById(id: string): Promise<Project | null> {
		const project = await prisma.project.findFirst({
			where: { id, userId: this.userId },
			include: {
				_count: {
					select: {
						tasks: {
							where: {
								deleted: false
							}
						}
					}
				},
				tasks: {
					where: {
						deleted: false,
						status: 'done'
					},
					select: {
						id: true
					}
				}
			}
		});

		if (!project) {
			return null;
		}

		const blockedTasks = await prisma.task.count({
			where: {
				projectId: id,
				deleted: false,
				status: 'blocked'
			}
		});

		return {
			...project,
			description: project.description || undefined,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
			taskCount: project._count.tasks,
			completedTaskCount: project.tasks.length,
			blockedTaskCount: blockedTasks
		};
	}

	async createProject(data: CreateProjectInput): Promise<Project> {
		const newProject = await prisma.project.create({
			data: {
				name: data.name,
				description: data.description || '',
				userId: this.userId,
				deleted: false
			}
		});

		return {
			...newProject,
			taskCount: 0,
			description: newProject.description || undefined,
			completedTaskCount: 0,
			blockedTaskCount: 0,
			createdAt: newProject.createdAt.toISOString(),
			updatedAt: newProject.updatedAt.toISOString()
		};
	}

	async updateProject(id: string, data: UpdateProjectInput): Promise<Project | null> {
		const project = await prisma.project.findFirst({ where: { id, userId: this.userId } });

		if (!project) {
			return null;
		}

		const updatedProject = await prisma.project.update({
			where: { id },
			data: {
				name: data.name,
				description: data.description
			},
			include: {
				_count: {
					select: {
						tasks: {
							where: {
								deleted: false
							}
						}
					}
				},
				tasks: {
					where: {
						deleted: false,
						status: 'done'
					},
					select: {
						id: true
					}
				}
			}
		});

		const blockedTasks = await prisma.task.count({
			where: {
				projectId: id,
				deleted: false,
				status: 'blocked'
			}
		});

		return {
			...updatedProject,
			taskCount: updatedProject._count.tasks,
			completedTaskCount: updatedProject.tasks.length,
			blockedTaskCount: blockedTasks,
			description: updatedProject.description || undefined,
			createdAt: updatedProject.createdAt.toISOString(),
			updatedAt: updatedProject.updatedAt.toISOString()
		};
	}

	async softDeleteProject(id: string): Promise<boolean> {
		const project = await prisma.project.findFirst({ where: { id, userId: this.userId } });

		if (!project) {
			return false;
		}

		await prisma.project.update({ where: { id }, data: { deleted: true } });

		await prisma.task.updateMany({ where: { projectId: id }, data: { deleted: true } });

		return true;
	}

	async restoreProject(id: string): Promise<boolean> {
		const project = await prisma.project.findFirst({ where: { id, userId: this.userId } });

		if (!project) {
			return false;
		}

		await prisma.project.update({ where: { id }, data: { deleted: false } });

		await prisma.task.updateMany({
			where: { projectId: id, deleted: true },
			data: { deleted: false }
		});

		return true;
	}

	async getDeletedProjects(): Promise<Project[]> {
		const projects = await prisma.project.findMany({
			where: { deleted: true, userId: this.userId },
			orderBy: { updatedAt: 'desc' },
			include: {
				_count: {
					select: {
						tasks: {
							where: {
								deleted: true
							}
						}
					}
				}
			}
		});

		return projects.map((project) => ({
			...project,
			description: project.description || undefined,
			createdAt: project.createdAt.toISOString(),
			updatedAt: project.updatedAt.toISOString(),
			taskCount: project._count.tasks
		}));
	}
}
