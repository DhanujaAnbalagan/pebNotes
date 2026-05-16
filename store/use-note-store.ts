import { create } from "zustand";

export interface Tag {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  archived: boolean;
  isPublic: boolean;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
  reminderAt: string | null;
  reminderDismissed: boolean;
  tags: Tag[];
  aiInsights?: AIInsight[];
}

export interface AIInsight {
  id: string;
  summary: string;
  actionItems: string; // JSON string in DB
  suggestedTitle: string | null;
  createdAt: string;
}

interface NoteState {
  notes: Note[];
  archivedNotes: Note[];
  activeNote: Note | null;
  isLoading: boolean;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  isGeneratingAI: boolean;
  aiError: string | null;
  
  setNotes: (notes: Note[]) => void;
  setArchivedNotes: (notes: Note[]) => void;
  setActiveNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  
  fetchNotes: (archived?: boolean, scheduled?: boolean) => Promise<void>;
  fetchNoteById: (id: string) => Promise<Note | null>;
  createNote: (data: Partial<Note>) => Promise<Note | null>;
  updateNote: (id: string, data: Omit<Partial<Note>, "tags"> & { tags?: string[] }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  archiveNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  generateAIInsights: (noteId: string) => Promise<void>;
  toggleShareNote: (noteId: string, action: "share" | "unshare") => Promise<void>;
  
  // Search & Filtering
  searchQuery: string;
  filterCategory: string;
  filterTag: string;
  sortBy: string;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterTag: (tag: string) => void;
  setSortBy: (sort: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  archivedNotes: [],
  activeNote: null,
  isLoading: false,
  isSaving: false,
  saveStatus: "idle",
  isGeneratingAI: false,
  aiError: null,
  searchQuery: "",
  filterCategory: "All",
  filterTag: "",
  sortBy: "newest",

  setNotes: (notes) => set({ notes }),
  setArchivedNotes: (notes) => set({ archivedNotes: notes }),
  setActiveNote: (activeNote) => set({ activeNote }),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setFilterTag: (filterTag) => set({ filterTag }),
  setSortBy: (sortBy) => set({ sortBy }),

  fetchNotes: async (archived = false, scheduled = false) => {
    set({ isLoading: true });
    try {
      const { searchQuery, filterCategory, filterTag, sortBy } = get();
      const params = new URLSearchParams({
        archived: String(archived),
        ...(scheduled && { scheduled: "true" }),
        ...(searchQuery && { q: searchQuery }),
        ...(filterCategory && filterCategory !== "All" && { category: filterCategory }),
        ...(filterTag && { tag: filterTag }),
        ...(sortBy && { sort: sortBy }),
      });

      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();
      if (archived) {
        set({ archivedNotes: data });
      } else {
        set({ notes: data });
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNoteById: async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`);
      const data = await res.json();
      if (data.error) return null;
      set({ activeNote: data });
      return data;
    } catch (error) {
      console.error("Failed to fetch note:", error);
      return null;
    }
  },

  createNote: async (data) => {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const note = await res.json();
      set((state) => ({ notes: [note, ...state.notes] }));
      return note;
    } catch (error) {
      console.error("Failed to create note:", error);
      return null;
    }
  },

  updateNote: async (id, data) => {
    const previousNotes = get().notes;
    const previousActiveNote = get().activeNote;
    const previousArchivedNotes = get().archivedNotes;

    set({ isSaving: true, saveStatus: "saving" });

    // Optimistic Update
    set((state) => {
      const updateLocalNote = (n: Note) => {
        if (n.id !== id) return n;
        // Handle tags specially if they are passed as strings
        const updatedTags = data.tags 
          ? data.tags.map(name => ({ id: `temp-${name}`, name })) 
          : n.tags;
        
        return { ...n, ...data, tags: updatedTags as Tag[], updatedAt: new Date().toISOString() };
      };

      return {
        notes: state.notes.map(updateLocalNote),
        archivedNotes: state.archivedNotes.map(updateLocalNote),
        activeNote: state.activeNote?.id === id ? updateLocalNote(state.activeNote) : state.activeNote,
      };
    });

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update note");

      const updatedNote = await res.json();
      
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        archivedNotes: state.archivedNotes.map((n) => (n.id === id ? updatedNote : n)),
        activeNote: state.activeNote?.id === id ? updatedNote : state.activeNote,
        saveStatus: "saved",
      }));
      
      setTimeout(() => {
        if (get().saveStatus === "saved") {
          set({ saveStatus: "idle" });
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to update note:", error);
      set({ 
        notes: previousNotes, 
        activeNote: previousActiveNote, 
        archivedNotes: previousArchivedNotes,
        saveStatus: "error" 
      });
    } finally {
      set({ isSaving: false });
    }
  },

  deleteNote: async (id) => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
        activeNote: state.activeNote?.id === id ? null : state.activeNote,
      }));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  },

  archiveNote: async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      const updatedNote = await res.json();
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        archivedNotes: [updatedNote, ...state.archivedNotes],
      }));
    } catch (error) {
      console.error("Failed to archive note:", error);
    }
  },

  restoreNote: async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: false }),
      });
      const updatedNote = await res.json();
      set((state) => ({
        archivedNotes: state.archivedNotes.filter((n) => n.id !== id),
        notes: [updatedNote, ...state.notes],
      }));
    } catch (error) {
      console.error("Failed to restore note:", error);
    }
  },

  generateAIInsights: async (noteId) => {
    set({ isGeneratingAI: true, aiError: null });
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI insights");
      }

      // Convert the response to match the AIInsight type if needed
      // Note: the API returns summary, action_items, suggested_title, id, createdAt
      const newInsight: AIInsight = {
        id: data.id,
        summary: data.summary,
        actionItems: JSON.stringify(data.action_items),
        suggestedTitle: data.suggested_title,
        createdAt: data.createdAt,
      };

      set((state) => {
        const updateNoteAI = (n: Note) => {
          if (n.id !== noteId) return n;
          const currentInsights = n.aiInsights || [];
          return { ...n, aiInsights: [newInsight, ...currentInsights] };
        };

        return {
          notes: state.notes.map(updateNoteAI),
          archivedNotes: state.archivedNotes.map(updateNoteAI),
          activeNote: state.activeNote?.id === noteId ? updateNoteAI(state.activeNote) : state.activeNote,
        };
      });

    } catch (error: any) {
      console.error("Failed to generate AI insights:", error);
      set({ aiError: error.message || "An error occurred" });
    } finally {
      set({ isGeneratingAI: false });
    }
  },

  toggleShareNote: async (noteId, action) => {
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const updatedNote = await res.json();
      
      set((state) => {
        const updateNoteShare = (n: Note) => n.id === noteId ? updatedNote : n;
        return {
          notes: state.notes.map(updateNoteShare),
          archivedNotes: state.archivedNotes.map(updateNoteShare),
          activeNote: state.activeNote?.id === noteId ? updatedNote : state.activeNote,
        };
      });
    } catch (error) {
      console.error("Failed to toggle share:", error);
    }
  },
}));
