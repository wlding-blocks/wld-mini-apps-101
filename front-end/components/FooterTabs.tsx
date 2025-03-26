"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Award } from "lucide-react";

export function FooterTabs() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg z-10">
      <div className="flex justify-around max-w-md mx-auto">
        <Link 
          href="/" 
          className="flex-1 flex flex-col items-center py-2"
        >
          <div className={`relative h-12 w-12 rounded-full flex items-center justify-center mb-1 ${
            isActive("/") 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md" 
              : "bg-gray-100"
          }`}>
            {isActive("/") && (
              <div className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            )}
            <Home className={`h-5 w-5 ${isActive("/") ? "text-white" : "text-gray-500"}`} />
          </div>
          <span className={`text-xs ${isActive("/") ? "font-medium" : ""}`}>Projects</span>
        </Link>

        <Link 
          href="/missions" 
          className="flex-1 flex flex-col items-center py-2"
        >
          <div className={`relative h-12 w-12 rounded-full flex items-center justify-center mb-1 ${
            isActive("/missions") 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md" 
              : "bg-gray-100"
          }`}>
            {isActive("/missions") && (
              <div className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            )}
            <Award className={`h-5 w-5 ${isActive("/missions") ? "text-white" : "text-gray-500"}`} />
          </div>
          <span className={`text-xs ${isActive("/missions") ? "font-medium" : ""}`}>Missions</span>
        </Link>
        
        <Link 
          href="/projects" 
          className="flex-1 flex flex-col items-center py-2"
        >
          <div className={`relative h-12 w-12 rounded-full flex items-center justify-center mb-1 ${
            isActive("/projects") 
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md" 
              : "bg-gray-100"
          }`}>
            {isActive("/projects") && (
              <div className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            )}
            <Compass className={`h-5 w-5 ${isActive("/projects") ? "text-white" : "text-gray-500"}`} />
          </div>
          <span className={`text-xs ${isActive("/projects") ? "font-medium" : ""}`}>Explore</span>
        </Link>
      </div>
    </div>
  );
} 