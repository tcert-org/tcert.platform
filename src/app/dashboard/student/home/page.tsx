'use client';

import Flipbook from '@/components/flipbook/Flipbook.jsx';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 px-4 items-center text-center">
      <h1 className="text-2xl font-bold text-primary-700 -mt-8">Material de tu Certificación</h1>
      <p className="text-base text-gray-600">
        Aquí puedes visualizar y repasar todos los recursos de tu certificación. ¡Explora el material y prepárate para avanzar!
      </p>
      <div className="w-full max-w-7xl h-[70vh] mx-auto mt-8">
        <Flipbook material="itil_dpi.pdf" />
      </div>
    </div>
  );
}