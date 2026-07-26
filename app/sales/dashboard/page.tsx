"use client";

import { useEffect, useState } from "react";

interface CarModel {
  id: string;
  name: string;
  baseSuffix: string;
  variant: string;
}

interface IncentiveSlab {
  id: string;
  minRange: number;
  maxRange: number | null;
  incentiveAmount: number;
}

interface SalesData {
  [carModelId: string]: number;
}

export default function SalesDashboard() {
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [slabs, setSlabs] = useState<IncentiveSlab[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salesData, setSalesData] = useState<SalesData>({});
  const [calculatedIncentives, setCalculatedIncentives] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [carModelsRes, slabsRes] = await Promise.all([
          fetch("/api/car-models"),
          fetch("/api/incentive-slabs"),
        ]);

        const carModelsData = await carModelsRes.json();
        const slabsData = await slabsRes.json();

        setCarModels(carModelsData);
        setSlabs(slabsData);

        // Initialize sales data
        const initialData: SalesData = {};
        carModelsData.forEach((model: CarModel) => {
          initialData[model.id] = 0;
        });
        setSalesData(initialData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateIncentive = (quantity: number): number => {
    const applicableSlab = slabs.find(
      (slab) =>
        quantity >= slab.minRange &&
        (slab.maxRange === null || quantity <= slab.maxRange)
    );
    return applicableSlab ? applicableSlab.incentiveAmount * quantity : 0;
  };

  const handleQuantityChange = (carModelId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setSalesData((prev) => ({
      ...prev,
      [carModelId]: quantity,
    }));

    // Update calculated incentive
    setCalculatedIncentives((prev) => ({
      ...prev,
      [carModelId]: calculateIncentive(quantity),
    }));
  };

  const getTotalIncentive = (): number => {
    return Object.values(calculatedIncentives).reduce((sum, val) => sum + val, 0);
  };

  const getTotalCars = (): number => {
    return Object.values(salesData).reduce((sum, val) => sum + val, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const entries = Object.entries(salesData)
        .filter(([, quantity]) => quantity > 0)
        .map(([carModelId, quantity]) => ({
          month,
          year,
          carModelId,
          quantity,
        }));

      if (entries.length === 0) {
        setError("Please enter sales data for at least one car model");
        return;
      }

      for (const entry of entries) {
        const res = await fetch("/api/sales-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save entry");
        }
      }

      setSuccess("Sales data saved successfully!");
      // Reset form
      const resetData: SalesData = {};
      carModels.forEach((model) => {
        resetData[model.id] = 0;
      });
      setSalesData(resetData);
      setCalculatedIncentives({});
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Cars Sold</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{getTotalCars()}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Total Incentive</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">
            ₹{getTotalIncentive().toLocaleString("en-IN")}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-700">Period</h3>
          <p className="text-lg font-semibold text-purple-600 mt-2">
            {new Date(year, month - 1).toLocaleString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-2xl font-bold mb-6">Log Sales</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1).toLocaleString("en-IN", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">
              Incentive Slabs Reference:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {slabs.map((slab) => (
                <div key={slab.id} className="bg-white p-3 rounded border">
                  <p className="text-sm font-semibold">
                    {slab.minRange} - {slab.maxRange ? slab.maxRange : "∞"} cars
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{slab.incentiveAmount}/car
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Car Models</h3>
            {carModels.length === 0 ? (
              <p className="text-gray-500">
                No car models configured. Please contact admin.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {carModels.map((model) => (
                  <div key={model.id} className="border rounded-lg p-4">
                    <label className="label">{model.name}</label>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          value={salesData[model.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(model.id, e.target.value)
                          }
                          placeholder="Enter quantity"
                          className="input"
                        />
                      </div>
                      <div className="text-right min-w-32">
                        <p className="text-sm text-gray-600">Incentive</p>
                        <p className="text-lg font-bold text-green-600">
                          ₹{(calculatedIncentives[model.id] || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary w-full text-lg">
            Save Sales Data
          </button>
        </form>
      </div>
    </div>
  );
}
