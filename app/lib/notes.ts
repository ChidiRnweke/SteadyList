import { v4 as uuidv4 } from "uuid"
import type { Note, CreateNoteInput, UpdateNoteInput } from "./types"

// Local storage key
const NOTES_KEY = "mock_notes"

// Helper function to get notes from localStorage
function getNotesFromStorage(): Note[] {
  if (typeof window === "undefined") {
    return []
  }

  const notesData = localStorage.getItem(NOTES_KEY)

  if (!notesData) {
    return []
  }

  try {
    return JSON.parse(notesData)
  } catch (error) {
    console.error("Failed to parse notes data:", error)
    return []
  }
}

// Helper function to save notes to localStorage
function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

// Get all notes
export async function getAllNotes(): Promise<Note[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return getNotesFromStorage()
}

// Get notes by project ID
export async function getNotesByProject(projectId: string): Promise<Note[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const notes = getNotesFromStorage()
  return notes.filter((note) => note.projectId === projectId)
}

// Get note by ID
export async function getNoteById(id: string): Promise<Note | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  const notes = getNotesFromStorage()
  return notes.find((note) => note.id === id) || null
}

// Create a new note
export async function createNote(data: CreateNoteInput): Promise<Note> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const notes = getNotesFromStorage()

  const newNote: Note = {
    id: uuidv4(),
    title: data.title,
    content: data.content,
    projectId: data.projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1", // Mock user ID
    deleted: false,
  }

  saveNotesToStorage([...notes, newNote])

  return newNote
}

// Update a note
export async function updateNote(id: string, data: UpdateNoteInput): Promise<Note | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const notes = getNotesFromStorage()
  const noteIndex = notes.findIndex((n) => n.id === id)

  if (noteIndex === -1) {
    return null
  }

  const updatedNote = {
    ...notes[noteIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  notes[noteIndex] = updatedNote
  saveNotesToStorage(notes)

  return updatedNote
}

// Soft delete a note
export async function softDeleteNote(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const notes = getNotesFromStorage()
  const noteIndex = notes.findIndex((n) => n.id === id)

  if (noteIndex === -1) {
    return false
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    deleted: true,
    updatedAt: new Date().toISOString(),
  }

  saveNotesToStorage(notes)

  return true
}
