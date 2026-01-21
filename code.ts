// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin creates slides and puts the user in grid view.
const numberOfSlides = 5;

const nodes: SlideNode[] = [];
for (let i = 0; i < numberOfSlides; i++) {
  const slide = figma.createSlide();
  nodes.push(slide);
}

figma.viewport.slidesView = 'grid';
figma.currentPage.selection = nodes;

// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
