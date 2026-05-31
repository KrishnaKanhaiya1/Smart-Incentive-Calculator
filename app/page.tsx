import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="text-center text-white max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-4">
          Smart Incentive Calculator
        </h1>
        <p className="text-xl mb-8 text-blue-100">
          Calculate tiered monthly incentives for vehicle sales officers with
          dynamic admin-controlled pricing models
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/auth/login"
            className="btn-primary px-6 py-3 text-lg"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="btn-secondary px-6 py-3 text-lg"
          >
            Register
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">Admin Portal</h3>
            <p className="text-blue-100">
              Manage car inventory, configure dynamic incentive slabs, and control the pricing model
            </p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">Sales Officer</h3>
            <p className="text-blue-100">
              Log sales volumes and track real-time incentive calculations based on current slabs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
