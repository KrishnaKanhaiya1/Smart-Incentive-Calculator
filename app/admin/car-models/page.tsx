"use client";

import { useEffect, useState } from "react";

interface CarModel {
  id: string;
  name: string;
  baseSuffix: string;
  variant: string;
}

export default function CarModelsPage() {
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    baseSuffix: "",
    variant: "",
  });

  useEffect(() => {
    fetchCarModels();
  }, []);

  const fetchCarModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/car-models");
      const data = await res.json();
      setCarModels(data);
    } catch (err) {
      setError("Failed to fetch car models");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/car-models/${editingId}` : "/api/car-models";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save car model");
      }

      setFormData({ name: "", baseSuffix: "", variant: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCarModels();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (model: CarModel) => {
    setFormData({
      name: model.name,
      baseSuffix: model.baseSuffix,
      variant: model.variant,
    });
    setEditingId(model.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car model?")) return;

    try {
      const res = await fetch(`/api/car-models/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCarModels();
    } catch (err) {
      setError("Failed to delete car model");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Car Models</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ name: "", baseSuffix: "", variant: "" });
            }
          }}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Add Car Model"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit Car Model" : "Add New Car Model"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Model Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Honda City"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Base Suffix</label>
              <input
                type="text"
                value={formData.baseSuffix}
                onChange={(e) =>
                  setFormData({ ...formData, baseSuffix: e.target.value })
                }
                placeholder="e.g., V"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Variant</label>
              <input
                type="text"
                value={formData.variant}
                onChange={(e) =>
                  setFormData({ ...formData, variant: e.target.value })
                }
                placeholder="e.g., Petrol"
                required
                className="input"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update" : "Create"} Car Model
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {carModels.length === 0 ? (
          <div className="card text-center text-gray-500">
            No car models found. Create your first one!
          </div>
        ) : (
          carModels.map((model) => (
            <div key={model.id} className="card flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{model.name}</h3>
                <p className="text-gray-600 text-sm">
                  {model.baseSuffix} - {model.variant}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(model)}
                  className="btn btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
