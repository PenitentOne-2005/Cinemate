"use client";

import { ProtectedRoute } from "@/app/components";

const HomePage = () => {
  return (
    <ProtectedRoute>
      {(user) => (
        <main>
          <h1>Home</h1>
          <p>Welcome to the Home page!</p>
        </main>
      )}
    </ProtectedRoute>
  );
};

export default HomePage;
