"use client";

import { useEffect, useState } from "react";

interface IncentiveSlab {
  id: string;
  minRange: number;
  maxRange: number | null;
  incentiveAmount: number;
}

export default function IncentiveSlabsPage() {
  const [slabs, setSlabs] = useState<IncentiveSlab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    minRange: "",
    maxRange: "",
    incentiveAmount: "",
  });

  useEffect(() => {
    fetchSlabs();
  }, []);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/incentive-slabs");
      const data = await res.json();
      setSlabs(data);
    } catch (err) {
      setError("Failed to fetch incentive slabs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const minRange = parseInt(formData.minRange);
      const maxRange = formData.maxRange ? parseInt(formData.maxRange) : null;
      const incentiveAmount = parseFloat(formData.incentiveAmount);

      if (isNaN(minRange) || isNaN(incentiveAmount)) {
        throw new Error("Invalid input values");
      }

      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/incentive-slabs/${editingId}` : "/api/incentive-slabs";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minRange, maxRange, incentiveAmount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save slab");
      }

      setFormData({ minRange: "", maxRange: "", incentiveAmount: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSlabs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (slab: IncentiveSlab) => {
    setFormData({
      minRange: slab.minRange.toString(),
      maxRange: slab.maxRange?.toString() || "",
      incentiveAmount: slab.incentiveAmount.toString(),
    });
    setEditingId(slab.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slab?")) return;

    try {
      const res = await fetch(`/api/incentive-slabs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchSlabs();
    } catch (err) {
      setError("Failed to delete slab");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Incentive Slabs</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ minRange: "", maxRange: "", incentiveAmount: "" });
            }
          }}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Add Slab"}
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
            {editingId ? "Edit Incentive Slab" : "Add New Incentive Slab"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Min Range (cars)</label>
                <input
                  type="number"
                  value={formData.minRange}
                  onChange={(e) =>
                    setFormData({ ...formData, minRange: e.target.value })
                  }
                  placeholder="e.g., 1"
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="label">Max Range (cars) - Leave empty for unlimited</label>
                <input
                  type="number"
                  value={formData.maxRange}
                  onChange={(e) =>
                    setFormData({ ...formData, maxRange: e.target.value })
                  }
                  placeholder="e.g., 3"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Incentive Amount (₹/car)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.incentiveAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, incentiveAmount: e.target.value })
                  }
                  placeholder="e.g., 1000"
                  required
                  className="input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              {editingId ? "Update" : "Create"} Slab
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Range</th>
              <th className="px-6 py-3 text-left font-semibold">Incentive (₹/car)</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slabs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No slabs found. Create your first one!
                </td>
              </tr>
            ) : (
              slabs.map((slab) => (
                <tr key={slab.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {slab.minRange} - {slab.maxRange ? slab.maxRange : "∞"} cars
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{slab.incentiveAmount}</td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(slab)}
                      className="btn btn-secondary text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slab.id)}
                      className="btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 card bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900">Example Slab Configuration:</h3>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-900">
          <li>1-3 cars: ₹1000 per car</li>
          <li>4-7 cars: ₹2000 per car</li>
          <li>8+ cars: ₹3500 per car</li>
        </ul>
      </div>
    </div>
  );
}
