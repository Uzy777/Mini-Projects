import { Route, Routes } from "react-router";
import UrlToMarkdownPage from "./features/url-to-markdown/UrlToMarkdownPage";
import VideoToGifPage from "./features/video-to-gif/VideoToGifPage";
import DocxToPdfPage from "./features/docx-to-pdf/DocxToPdfPage";
import ImageConverterPage from "./features/image-converter/ImageConverterPage";
import HomePage from "../pages/HomePage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/tools/url-to-markdown" element={<UrlToMarkdownPage />} />
            <Route path="/tools/video-to-gif" element={<VideoToGifPage />} />
            <Route path="/tools/docx-to-pdf" element={<DocxToPdfPage />} />
            <Route path="/tools/image-converter" element={<ImageConverterPage />} />
        </Routes>
    );
}

export default App;
