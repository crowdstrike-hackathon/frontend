import "@testing-library/jest-dom";

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = global.IntersectionObserver || MockObserver;
global.ResizeObserver = global.ResizeObserver || MockObserver;

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  });
}

if (!window.SVGElement.prototype.getTotalLength) {
  window.SVGElement.prototype.getTotalLength = () => 0;
  window.SVGElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 });
}
window.HTMLCanvasElement.prototype.getContext = () => null;
