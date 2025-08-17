import type { Note, CreateNoteInput, UpdateNoteInput } from './types';
import prisma from './prisma';

// Interface for notes service
export interface INotesService {
	getAllNotes(): Promise<Note[]>;
	getNoteById(id: string): Promise<Note | null>;
	getNotesByProject(projectId: string): Promise<Note[]>;
	createNote(data: CreateNoteInput): Promise<Note>;
	updateNote(id: string, data: UpdateNoteInput): Promise<Note | null>;
	softDeleteNote(id: string): Promise<boolean>;
}

export class NotesService implements INotesService {
	constructor(private userId: string) {}

	async getAllNotes(): Promise<Note[]> {
		const notes = await prisma.note.findMany({
			where: { deleted: false, userId: this.userId },
			orderBy: { updatedAt: 'desc' }
		});

		return notes.map((note) => ({
			...note,
			createdAt: note.createdAt.toISOString(),
			updatedAt: note.updatedAt.toISOString()
		}));
	}

	async getNoteById(id: string): Promise<Note | null> {
		const note = await prisma.note.findFirst({
			where: { id, userId: this.userId }
		});

		return note
			? {
					...note,
					createdAt: note.createdAt.toISOString(),
					updatedAt: note.updatedAt.toISOString()
				}
			: null;
	}

	async getNotesByProject(projectId: string): Promise<Note[]> {
		const notes = await prisma.note.findMany({
			where: {
				projectId,
				deleted: false,
				userId: this.userId
			},
			orderBy: { updatedAt: 'desc' }
		});

		return notes.map((note) => ({
			...note,
			createdAt: note.createdAt.toISOString(),
			updatedAt: note.updatedAt.toISOString()
		}));
	}

	async createNote(data: CreateNoteInput): Promise<Note> {
		const newNote = await prisma.note.create({
			data: {
				title: data.title,
				content: data.content,
				projectId: data.projectId,
				userId: this.userId,
				deleted: false,
				shareable: data.shareable || false
			}
		});

		return {
			...newNote,
			createdAt: newNote.createdAt.toISOString(),
			updatedAt: newNote.updatedAt.toISOString()
		};
	}

	async updateNote(id: string, data: UpdateNoteInput): Promise<Note | null> {
		const note = await prisma.note.findFirst({ where: { id, userId: this.userId } });

		if (!note) {
			return null;
		}

		const updatedNote = await prisma.note.update({
			where: { id },
			data: {
				title: data.title,
				content: data.content,
				projectId: data.projectId,
				shareable: data.shareable !== undefined ? data.shareable : note.shareable
			}
		});

		return {
			...updatedNote,
			createdAt: updatedNote.createdAt.toISOString(),
			updatedAt: updatedNote.updatedAt.toISOString()
		};
	}

	async softDeleteNote(id: string): Promise<boolean> {
		const note = await prisma.note.findFirst({ where: { id, userId: this.userId } });

		if (!note) {
			return false;
		}

		await prisma.note.update({ where: { id }, data: { deleted: true } });

		return true;
	}
}
