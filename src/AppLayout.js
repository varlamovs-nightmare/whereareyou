import React from 'react';

import './App.scss';
import 'leaflet/dist/leaflet.css';

export function AppLayout({ children }) {
  return (
    <div className="App">
      {children}
    </div>
  )
}