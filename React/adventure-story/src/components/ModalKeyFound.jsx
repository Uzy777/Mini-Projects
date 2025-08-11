import React from "react";

export default function Modal({ show, onClose, title, children }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            {/* Modal content */}
            <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl max-w-md w-full transform transition-all scale-100 animate-fadeIn">
                {title && <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>}
                <div className="mb-4 text-gray-200">{children}</div>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition"
                    >
                        Continue to next biome
                    </button>
                </div>
            </div>
        </div>
    );
}
