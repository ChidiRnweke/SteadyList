// place files you want to import through the `$lib` alias in this folder.

import { NotesService } from './notes';
import { NotificationsService } from './notifications';
import { ProjectsService } from './projects';
import { PromisesService } from './promises';
import { TasksService } from './tasks';

export { NotesService } from './notes';
export type { INotesService } from './notes';
export { NotificationsService } from './notifications';
export type { INotificationsService, NotificationInput } from './notifications';
export { ProjectsService } from './projects';
export type { IProjectsService } from './projects';
export { TasksService } from './tasks';
export type { ITasksService } from './tasks';
export { PromisesService } from './promises';
export type { IPromisesService } from './promises';

export function createServices(userId: string) {
	const notes = new NotesService(userId);
	const notifications = new NotificationsService(userId);
	const projects = new ProjectsService(userId);
	const tasks = new TasksService(userId);
	const promises = new PromisesService(userId);

	return { notes, notifications, projects, tasks, promises };
}
