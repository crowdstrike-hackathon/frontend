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
