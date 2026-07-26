"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    carModels: 0,
    incentiveSlabs: 0,
    salesEntries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [carModels, slabs, sales] = await Promise.all([
          fetch("/api/car-models").then((r) => r.json()),
          fetch("/api/incentive-slabs").then((r) => r.json()),
          fetch("/api/sales-entries").then((r) => r.json()),
        ]);

        setStats({
          carModels: carModels.length,
          incentiveSlabs: slabs.length,
          salesEntries: sales.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-700">Car Models</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.carModels}</p>
          <p className="text-gray-500 text-sm mt-2">Total configured models</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-700">Incentive Slabs</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.incentiveSlabs}</p>
          <p className="text-gray-500 text-sm mt-2">Active slab tiers</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-700">Sales Entries</h2>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.salesEntries}</p>
          <p className="text-gray-500 text-sm mt-2">Recorded transactions</p>
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/car-models" className="btn-primary block text-center">
            Manage Car Models
          </a>
          <a href="/admin/incentive-slabs" className="btn-primary block text-center">
            Configure Incentive Slabs
          </a>
        </div>
      </div>
    </div>
  );
}
