import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useUser, SignIn, SignUp, SignOutButton } from '@clerk/clerk-react';
import Home from './pages/Home';
import History from './pages/History';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

export default function App() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            CarLens
          </Link>
          {isLoaded && isSignedIn && (
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-300 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <Link to="/history" className="text-slate-300 hover:text-white text-sm transition-colors">
                History
              </Link>
              <SignOutButton>
                <button className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md transition-colors">
                  Sign out
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route
            path="/sign-in/*"
            element={
              <div className="flex justify-center mt-8">
                <SignIn routing="path" path="/sign-in" />
              </div>
            }
          />
          <Route
            path="/sign-up/*"
            element={
              <div className="flex justify-center mt-8">
                <SignUp routing="path" path="/sign-up" />
              </div>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
