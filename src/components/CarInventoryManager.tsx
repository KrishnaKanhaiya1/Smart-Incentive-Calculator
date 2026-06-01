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

const getCarImage = (modelName: string) => {
  const name = modelName.toLowerCase();
  if (name.includes("fortuner")) return "/fortuner.png";
  if (name.includes("innova")) return "/innova.png";
  if (name.includes("hyryder")) return "/hyryder.png";
  if (name.includes("vellfire")) return "/vellfire.png";
  if (name.includes("glanza")) return "/glanza.png";
  if (name.includes("camry")) return "/camry.png";
  return "/camry.png"; // Fallback to Camry
};

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
        <div className="p-8 text-center border border-dashed border-white/[0.06] bg-[#0b0c14]/40 rounded-2xl">
          <AlertCircle className="h-7 w-7 text-slate-550 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">
            {searchQuery
              ? "No vehicle registry logs match your query."
              : "No vehicles in inventory. Add a vehicle model above to get started."}
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className={`flex flex-col justify-between p-0 rounded-3xl border transition-all duration-500 relative group overflow-hidden ${
                  car.isActive
                    ? "bg-[#0b0c14] border-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:border-primary/20"
                    : "bg-[#08080c]/60 border-white/[0.02] opacity-65 hover:opacity-85 shadow-none"
                }`}
              >
                {editingId === car.id ? (
                  <div className="p-5 space-y-3.5">
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
                        className="h-9 text-xs bg-slate-950 border-white/[0.08] focus-visible:ring-primary/30"
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
                        className="h-9 text-xs bg-slate-950 border-white/[0.08] focus-visible:ring-primary/30"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => handleUpdate(car)}
                        disabled={savingId === car.id}
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all disabled:opacity-50"
                      >
                        {savingId === car.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-slate-400 hover:bg-white/[0.05] rounded-xl transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Visual Render Header Section */}
                    <div className="relative aspect-[1.8/1] w-full overflow-hidden bg-black/40 border-b border-white/[0.03] flex items-center justify-center p-1">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c14] to-transparent opacity-80 z-10 pointer-events-none" />
                      
                      <img
                        src={getCarImage(car.modelName)}
                        alt={car.modelName}
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-[8000ms] ease-out z-0 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] select-none pointer-events-none"
                      />
                      
                      {/* Interactive Status Indicator - subtle pulsing gradient badge */}
                      <button
                        onClick={() => handleToggleActive(car)}
                        disabled={savingId === car.id}
                        className={`absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase border tracking-widest transition-all duration-300 disabled:opacity-50 ${
                          car.isActive
                            ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                            : "bg-slate-900/80 text-slate-400 border-slate-750 hover:bg-slate-800"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          car.isActive 
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" 
                            : "bg-slate-500"
                        }`} />
                        {car.isActive ? "Live" : "Draft"}
                      </button>

                      {/* Class Category Badge */}
                      <span className="absolute top-4 left-4 z-20 px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                        {car.modelName.toLowerCase().includes("fortuner") || car.modelName.toLowerCase().includes("hyryder") ? "SUV" : 
                         car.modelName.toLowerCase().includes("vellfire") ? "Luxury MUV" : 
                         car.modelName.toLowerCase().includes("camry") ? "Premium Sedan" : "Hatchback"}
                      </span>
                    </div>

                    {/* Card Content & Action Bar */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-base text-slate-100 group-hover:text-primary transition-colors leading-tight">
                          {car.modelName}
                        </h4>
                        <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                          {car.variant}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-3 border-t border-white/[0.04] opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {car.isActive ? "Visible in Portal" : "Registry Locked"}
                        </span>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => startEdit(car)}
                            disabled={savingId === car.id}
                            className="p-2 text-slate-450 hover:text-white hover:bg-white/[0.04] rounded-xl transition-all disabled:opacity-50"
                            title="Edit Model Details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(car)}
                            disabled={savingId === car.id}
                            className="p-2 text-slate-450 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                            title="Permanently Delete Model"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
