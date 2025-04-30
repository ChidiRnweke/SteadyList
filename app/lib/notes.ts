import { v4 as uuidv4 } from "uuid"
import type { Note, CreateNoteInput, UpdateNoteInput } from "./types"
import { prisma } from "./db"

// Get all notes
export async function getAllNotes(): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { deleted: false },
    orderBy: { updatedAt: 'desc' }
  })
  
  return notes.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }))
}

// Get note by ID
export async function getNoteById(id: string): Promise<Note | null> {
  const note = await prisma.note.findUnique({
    where: { id }
  })
  
  return note ? {
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  } : null
}

// Get notes by project ID
export async function getNotesByProject(projectId: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: { 
      projectId,
      deleted: false 
    },
    orderBy: { updatedAt: 'desc' }
  })
  
  return notes.map((note) => ({
    ...note,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  })) 
}

// Create a new note
export async function createNote(data: CreateNoteInput): Promise<Note> {
  const newNote = await prisma.note.create({
    data: {
      title: data.title,
      content: data.content,
      projectId: data.projectId,
      userId: "user-1", // Mock user ID, will be replaced with actual auth
      deleted: false,
    }
  })

  return {
    ...newNote,
    createdAt: newNote.createdAt.toISOString(),
    updatedAt: newNote.updatedAt.toISOString(),
  } 
}

// Update a note
export async function updateNote(id: string, data: UpdateNoteInput): Promise<Note | null> {
  const note = await prisma.note.findUnique({
    where: { id }
  })

  if (!note) {
    return null
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      projectId: data.projectId,
    }
  })

  return {
    ...updatedNote,
    createdAt: updatedNote.createdAt.toISOString(),
    updatedAt: updatedNote.updatedAt.toISOString(),
  }
}

// Soft delete a note
export async function softDeleteNote(id: string): Promise<boolean> {
  const note = await prisma.note.findUnique({
    where: { id }
  })

  if (!note) {
    return false
  }

  await prisma.note.update({
    where: { id },
    data: { deleted: true }
  })

  return true
}
