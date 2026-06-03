"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Car,
  Search,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ConfirmDialog";

interface CarModel {
  id: string;
  modelName: string;
  variant: string;
  isActive: boolean;
}

interface EditState {
  modelName: string;
  variant: string;
}

export default function CarInventoryManager() {
  const [cars, setCars] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    modelName: "",
    variant: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newCar, setNewCar] = useState<EditState>({
    modelName: "",
    variant: "",
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarModel | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cars");
      if (!res.ok) throw new Error("Failed to load car models.");
      const data = await res.json();
      setCars(data.cars || []);
    } catch {
      toast.error("Failed to load car inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleCreate = async () => {
    if (!newCar.modelName.trim() || !newCar.variant.trim()) {
      toast.error("Both model name and variant are required.");
      return;
    }
    setSavingId("new");
    try {
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: newCar.modelName.trim(),
          variant: newCar.variant.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create.");
      setCars((prev) => [...prev, data.car]);
      setNewCar({ modelName: "", variant: "" });
      setIsAdding(false);
      toast.success(`${data.car.modelName} — ${data.car.variant} added successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create car model."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdate = async (car: CarModel) => {
    if (!editState.modelName.trim() || !editState.variant.trim()) {
      toast.error("Both model name and variant are required.");
      return;
    }
    setSavingId(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: editState.modelName.trim(),
          variant: editState.variant.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? data.car : c))
      );
      setEditingId(null);
      toast.success("Car model updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update car model."
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (car: CarModel) => {
    setSavingId(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !car.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle.");
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? data.car : c))
      );
      toast.success(
        `${car.modelName} is now ${!car.isActive ? "active" : "inactive"}.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status."
      );
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const car = deleteTarget;
    setDeleteTarget(null);
    setSavingId(car.id);
    try {
      const res = await fetch(`/api/admin/cars/${car.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      toast.success(`${car.modelName} — ${car.variant} deleted successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete car model."
      );
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (car: CarModel) => {
    setEditingId(car.id);
    setEditState({ modelName: car.modelName, variant: car.variant });
  };

  const filteredCars = cars.filter(
    (car) =>
      car.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.variant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200/50 dark:border-slate-700/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Vehicle Model"
        description={deleteTarget ? `Permanently delete "${deleteTarget.modelName} — ${deleteTarget.variant}"? This will remove all associated sales records and cannot be undone.` : ""}
        confirmLabel="Delete Permanently"
        variant="danger"
      />

      {/* Header filter actions bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search models or variants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all text-slate-700 dark:text-slate-200 font-medium"
          />
        </div>

        <button
          onClick={() => {
            setIsAdding(true);
            setNewCar({ modelName: "", variant: "" });
          }}
          disabled={isAdding}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Add New Vehicle
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <span className="flex items-center gap-1">
          <Car className="h-3.5 w-3.5" />
          {cars.length} Models
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {cars.filter((c) => c.isActive).length} Live
        </span>
        <span className="text-slate-400">
          {cars.filter((c) => !c.isActive).length} Inactive
        </span>
      </div>

      {/* Add New Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl relative">
              <div className="absolute top-0 right-0 p-3 pointer-events-none opacity-20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Model Name (e.g., Toyota Innova Hycross)"
                    value={newCar.modelName}
                    onChange={(e) =>
                      setNewCar((prev) => ({ ...prev, modelName: e.target.value }))
                    }
                    autoFocus
                    className="h-9 text-xs bg-white dark:bg-slate-800 focus-visible:ring-indigo-500/25 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Variant Name (e.g., ZX Hybrid CVT)"
                    value={newCar.variant}
                    onChange={(e) =>
                      setNewCar((prev) => ({ ...prev, variant: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                    }}
                    className="h-9 text-xs bg-white dark:bg-slate-800 focus-visible:ring-indigo-500/25 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={handleCreate}
                  disabled={savingId === "new"}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingId === "new" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {filteredCars.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 rounded-2xl">
          <AlertCircle className="h-7 w-7 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">
            {searchQuery
              ? "No vehicle registry logs match your query."
              : "No vehicles in inventory. Add a vehicle model above to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCars.map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.25 }}
              className={`flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                car.isActive
                  ? "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md"
                  : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60 hover:opacity-85"
              }`}
            >
              {editingId === car.id ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      value={editState.modelName}
                      onChange={(e) =>
                        setEditState((prev) => ({
                          ...prev,
                          modelName: e.target.value,
                        }))
                      }
                      autoFocus
                      className="h-8 text-xs bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500/25"
                    />
                    <Input
                      type="text"
                      value={editState.variant}
                      onChange={(e) =>
                        setEditState((prev) => ({
                          ...prev,
                          variant: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(car);
                      }}
                      className="h-8 text-xs bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500/25"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleUpdate(car)}
                      disabled={savingId === car.id}
                      className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg transition-all disabled:opacity-50 shadow-inner"
                    >
                      {savingId === car.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:rotate-6 duration-300 ${
                        car.isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}>
                        <Car className="h-4 w-4" />
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate leading-snug">
                          {car.modelName}
                        </h4>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          {car.variant}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(car)}
                      disabled={savingId === car.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border tracking-wider transition-all disabled:opacity-50 ${
                        car.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-100/50"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full ${car.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {car.isActive ? "Live" : "Inactive"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100/60 dark:border-slate-800/60 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {car.isActive ? "Visible to Officers" : "Hidden from Officers"}
                    </span>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(car)}
                        disabled={savingId === car.id}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all disabled:opacity-50"
                        title="Edit Model Details"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(car)}
                        disabled={savingId === car.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all disabled:opacity-50"
                        title="Permanently Delete Model"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
