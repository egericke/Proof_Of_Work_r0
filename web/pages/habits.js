// web/pages/habits.js
import React, { useEffect, useState } from 'react';

export default function Habits() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    async function fetchHabits() {
      const res = await fetch('/api/habits');
      const data = await res.json();
      setHabits(data);
    }
    fetchHabits();
  }, []);

  return (
    <div>
      <h1>Habit Tracking (Last 14 Days)</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Date</th>
            <th>Habit</th>
            <th>Completed</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {habits.map((h) => (
            <tr key={h.id}>
              <td>{h.habit_date}</td>
              <td>{h.habit_name}</td>
              <td>{h.completed ? 'Yes' : 'No'}</td>
              <td>{h.notes || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
