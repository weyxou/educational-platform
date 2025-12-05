// Dashboard.jsx
import React from 'react';

const Dashboard = () => {
  return (
    <main className="flex-1 bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <p className="text-gray-600 mb-8">Welcome to your learning platform!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((card) => (
          <div key={card} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Course {card}</h3>
            <p className="text-sm text-gray-500">Progress: {Math.floor(Math.random() * 100)}%</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
