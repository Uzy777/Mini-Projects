import React from "react";

export default function SceneImage({ src }) {
    if (!src) return null;

    return (
        <div className="flex justify-center my-4">
            <img
                src={src}
                alt="Scene"
                className="rounded-lg shadow-lg max-h-96 object-contain"
            />
        </div>
    );
}
