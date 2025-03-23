"use client";
import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { projects } from "@/lib/data";

export default function Home() {
  // Calculate totals for the summary
  const totalValue = projects.reduce(
    (sum, project) => sum + project.tokenPrice * project.tokenAmount,
    0
  );
  const totalTokens = projects.length;

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-gradient-to-b from-blue-50 to-cyan-50">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-b-3xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2 flex items-center justify-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Earning Opportunities
        </h1>
        <p className="text-white/80 text-sm mb-4">
          Discover projects and earn rewards
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4 max-w-xs mx-auto">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-white/70">Total Value</p>
            <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-xs text-white/70">Projects</p>
            <p className="text-xl font-bold">{totalTokens}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Available Projects
        </h2>

        <div className="grid gap-5 max-w-sm mx-auto">
          {projects.map((project, index) => {
            // Create different gradient backgrounds for each card
            const gradients = [
              "from-blue-500 to-cyan-400",
              "from-teal-500 to-green-400",
              "from-orange-400 to-amber-500",
              "from-rose-400 to-pink-500",
              "from-sky-400 to-blue-500",
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg overflow-hidden border-0 shadow-lg"
              >
                <div className={`h-3 bg-gradient-to-r ${gradient}`}></div>
                <div className="p-4 pt-5 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`bg-gradient-to-br ${gradient} rounded-full p-3 shadow-md`}
                    >
                      <img
                        src={project.tokenIcon || "/placeholder.svg"}
                        alt={`${project.tokenSymbol} icon`}
                        className="w-8 h-8"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{project.name}</h2>
                      <p className="text-sm text-gray-500">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <p className="text-sm font-medium text-green-800">
                      Potential Earnings
                    </p>
                    <p className="text-xl font-bold text-green-700 mt-1">
                      $
                      {(
                        project.tokenPrice * project.tokenAmount
                      ).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <p className="text-xs text-green-600">
                        {project.tokenAmount.toLocaleString()}{" "}
                        {project.tokenSymbol}
                      </p>
                      <p className="text-xs text-green-600">
                        @ ${project.tokenPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg shadow-md text-center font-medium"
                  >
                    Visit Project{" "}
                    <ExternalLink className="inline-block ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improved Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg">
        <div className="flex justify-around max-w-xs mx-auto">
          <button
            className="flex-1 flex flex-col items-center py-3 relative"
            disabled
          >
            <div className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-1 text-white shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
                <path d="M4 11V8a1 1 0 0 1 .4-.8l6.6-5.2a1 1 0 0 1 1.2 0l6.6 5.2a1 1 0 0 1 .4.8v3" />
              </svg>
            </div>
            <span className="text-xs font-medium">Projects</span>
          </button>

          <Link
            href="/missions"
            className="flex-1 flex flex-col items-center py-3"
          >
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-1 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M20 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                <path d="M4 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M16 12h-4" />
                <path d="M4 12h4" />
                <path d="M12 16v-4" />
                <path d="M12 4v4" />
              </svg>
            </div>
            <span className="text-xs">Missions</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
