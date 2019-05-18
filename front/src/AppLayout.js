import React from 'react';

import './App.css';
import 'leaflet/dist/leaflet.css';

export function AppLayout({ children }) {
  return (
    <div className="App">
      {children}
    </div>
  )
}