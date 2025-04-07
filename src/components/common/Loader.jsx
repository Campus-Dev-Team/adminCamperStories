import React from 'react';

const Loader = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0B1A] z-50">
        <div className="relative flex justify-center">
          <div className="w-16 h-16 rounded-full absolute
                        border-4 border-solid border-[#1E213D]"></div>
          <div className="w-16 h-16 rounded-full animate-spin absolute
                        border-4 border-solid border-indigo-600 border-t-transparent
                        shadow-lg"></div>
          <div className="mt-24 text-white text-center">
            Cargando...
          </div>
        </div>
      </div>
    );
  };

export default Loader;

