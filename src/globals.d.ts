interface Window {
  zoomAPI: {
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
  };
  navigationAPI: {
	newWindow: (filename: string) => void;
  };
}