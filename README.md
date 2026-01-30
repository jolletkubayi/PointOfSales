# Spaza Point of Sale

A lightweight, offline-first point of sale concept for South African spaza shops. The interface is built for phone scanning workflows: scan stock in, scan at checkout, and track inventory, damages, sundry costs, and sales analytics.

## Preview

![Spaza POS preview](docs/preview.svg)

## Features

- Barcode-first stock intake and sales capture.
- Inventory tracking with reorder alerts and average cost value.
- South African brand libraries for grocery, clothing, and pool-table entertainment stores with manual overrides.
- Damages and sundry expense tracking.
- Sales, gross profit, total costs, and net result insights.
- Local-first storage using `localStorage` for low data usage.

## Usage

1. Open `index.html` in a browser.
2. Choose a store type to load a relevant brand library.
3. Use **Stock intake** to register incoming items.
4. Use **Sell items** to record sales.
5. Add damages and sundry expenses to keep a full business view.

## Testing

From the project folder (`PointOfSales`), serve the static app locally and open it in your browser:

```bash
cd /path/to/PointOfSales
python -m http.server 8000
```

Then visit `http://localhost:8000` and interact with the UI.

## Next steps

- Integrate barcode scanning via device camera (e.g., `getUserMedia`).
- Add supplier management and purchase orders.
- Sync data to a cloud service for multi-device access.
