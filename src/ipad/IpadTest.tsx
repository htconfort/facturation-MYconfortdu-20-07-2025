import React from 'react';

export default function IpadTest() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-[1024px] h-[768px] bg-white p-8">
        <h1 className="text-3xl font-bold text-center">Test iPad Mode</h1>
        <p className="text-center mt-4">Si vous voyez ceci, l'iPad mode fonctionne!</p>
      </div>
    </div>
  );
}
