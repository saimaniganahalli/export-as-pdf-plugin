"use strict";
// Export all slides as a single PDF
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Hidden UI - only used for PDF generation (browser APIs needed)
figma.showUI(__html__, { visible: false });
function exportSlidesAsPDF() {
    return __awaiter(this, void 0, void 0, function* () {
        // Small delay to ensure UI is ready
        yield new Promise(resolve => setTimeout(resolve, 100));
        // Load all pages first (required by Figma API)
        yield figma.loadAllPagesAsync();
        // Get all slides from SLIDE_GRID > SLIDE_ROW > SLIDE structure
        let slides = [];
        function findSlides(node) {
            if (node.type === 'SLIDE') {
                slides.push(node);
                return;
            }
            if (node.children) {
                for (const child of node.children) {
                    findSlides(child);
                }
            }
        }
        for (const page of figma.root.children) {
            for (const child of page.children) {
                if (child.type === 'SLIDE_GRID') {
                    findSlides(child);
                }
            }
        }
        if (slides.length === 0) {
            figma.notify('No slides found. Make sure this is a Figma Slides document.', { error: true });
            figma.closePlugin();
            return;
        }
        figma.notify(`Found ${slides.length} slides. Exporting...`);
        // Tell UI how many slides to expect
        figma.ui.postMessage({
            type: 'init',
            totalSlides: slides.length
        });
        // Export each slide as PNG and send to UI
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];
            figma.notify(`Exporting slide ${i + 1} of ${slides.length}...`, { timeout: 1000 });
            try {
                const imageData = yield slide.exportAsync({
                    format: 'PNG',
                    constraint: { type: 'SCALE', value: 2 } // 2x scale for good quality without memory issues
                });
                const base64 = figma.base64Encode(imageData);
                figma.ui.postMessage({
                    type: 'slide-image',
                    index: i,
                    imageData: `data:image/png;base64,${base64}`,
                    width: slide.width,
                    height: slide.height
                });
            }
            catch (error) {
                console.error(`Error exporting slide ${i}:`, error);
                figma.notify(`Error exporting slide ${i + 1}`, { error: true });
            }
        }
        figma.notify('Generating PDF...');
        // Get document name for the PDF filename
        const fileName = figma.root.name || 'slides';
        // Tell UI to generate the PDF
        figma.ui.postMessage({
            type: 'generate-pdf',
            fileName: fileName
        });
    });
}
// Handle messages from UI
figma.ui.onmessage = (msg) => {
    if (msg.type === 'done') {
        figma.notify(`PDF exported with ${msg.count} slides!`, { timeout: 3000 });
        figma.closePlugin();
    }
    if (msg.type === 'error') {
        figma.notify(`Error: ${msg.message}`, { error: true });
        figma.closePlugin();
    }
};
// Start the export
exportSlidesAsPDF();
