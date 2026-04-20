"use client";

import { useState, useEffect } from "react";
import { FileText, Trash2, Send, X } from "lucide-react";
import toast from "react-hot-toast";

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface PatientNotesProps {
  clientId: string;
  patientName: string;
}

export default function PatientNotes({ clientId, patientName }: PatientNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [sending, setSending] = useState(false);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/patients/notes?clientId=${clientId}`);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen && notes.length === 0) {
      fetchNotes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleAddNote() {
    if (!newNote.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/dashboard/patients/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, content: newNote }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setNotes((prev) => [data.note, ...prev]);
        setNewNote("");
        toast.success("Note ajoutée");
      }
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(noteId: string) {
    try {
      const res = await fetch(`/api/dashboard/patients/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Note supprimée");
      }
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  function formatNoteDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
      >
        <FileText className="h-3.5 w-3.5" />
        <span>Notes privées</span>
        {notes.length > 0 && (
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
            {notes.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mt-3 border border-emerald-200 rounded-xl bg-emerald-50/50 p-3 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">
            Notes — {patientName}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <X className="h-4 w-4 text-emerald-600" />
        </button>
      </div>

      {/* Add note form */}
      <div className="flex gap-2 mb-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ajouter une note privée..."
          className="flex-1 text-sm rounded-lg border border-emerald-200 px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors bg-white"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddNote();
            }
          }}
        />
        <button
          onClick={handleAddNote}
          disabled={sending || !newNote.trim()}
          className="self-end px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <p className="text-xs text-gray-400 text-center py-2">Chargement...</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">
          Aucune note pour ce patient
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg px-3 py-2 border border-emerald-100 group"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1">
                  {note.content}
                </p>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {formatNoteDate(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
