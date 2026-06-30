function VideoToGifForm() {
    return (
        <form className="mt-6 grid gap-4">
            <div>
                <label htmlFor="video-file" className="mb-2 block font-medium text-slate-900">
                    Choose a video
                </label>

                <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
            </div>

            <p className="text-sm text-slate-500">Videos must be 30 seconds or shorter.</p>

            <button type="submit" className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
                Convert to GIF
            </button>
        </form>
    );
}

export default VideoToGifForm;
