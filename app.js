const STORAGE_KEY = "spaza-pos-data";

const storeTypeSelect = document.getElementById("store-type");
const resetButton = document.getElementById("reset-data");
const intakeForm = document.getElementById("intake-form");
const saleForm = document.getElementById("sale-form");
const addProductButton = document.getElementById("add-product");
const productForm = document.getElementById("product-form");
const brandSelect = document.getElementById("product-brand");
const brandHint = document.getElementById("brand-hint");
const inventoryTable = document.getElementById("inventory-table");
const inventorySummary = document.getElementById("inventory-summary");
const lowStockList = document.getElementById("low-stock");
const damageForm = document.getElementById("damage-form");
const sundryForm = document.getElementById("sundry-form");
const notesField = document.getElementById("notes");
const metricSales = document.getElementById("metric-sales");
const metricProfit = document.getElementById("metric-profit");
const metricCosts = document.getElementById("metric-costs");
const metricNet = document.getElementById("metric-net");
const topItemsList = document.getElementById("top-items");
const activityFeed = document.getElementById("activity-feed");
const toast = document.getElementById("toast");

const brandLibrary = {
  grocery: [
    "Albany",
    "Amajoya",
    "Blue Band",
    "Clover",
    "Coca-Cola",
    "Cremora",
    "Dairy Milk",
    "Dettol",
    "Five Roses",
    "Fanta",
    "Huletts",
    "Iwisa",
    "Jungle Oats",
    "Koo",
    "Kellogg's",
    "Knorrox",
    "Lays",
    "Nola",
    "Oros",
    "Parmalat",
    "Pick n Pay",
    "Purity",
    "Ricoffy",
    "Rhodes",
    "Rooibos",
    "Sasko",
    "Simba",
    "Sunlight",
    "Tastic",
    "Tropika",
    "Weet-Bix",
    "White Star"
  ],
  clothing: [
    "Ackermans",
    "Cape Union Mart",
    "Cotton On",
    "Foschini",
    "H&M",
    "Jet",
    "Levi's",
    "Mr Price",
    "Pep",
    "Pick n Pay Clothing",
    "Puma",
    "Shesha",
    "Sportscene",
    "Studio 88",
    "Superbalist",
    "Truworths",
    "Woolworths",
    "YDE",
    "Zara"
  ],
  pool: [
    "Aramith",
    "Buffalo",
    "CueSport",
    "Empire",
    "Garlando",
    "Hainsworth",
    "Peradon",
    "Riley",
    "Strachan",
    "Supreme",
    "Table Tech",
    "UrbanSport",
    "Victory"
  ],
  other: ["Generic", "Local Supplier", "Custom Brand"]
};

const initialData = {
  storeType: "grocery",
  products: [
    {
      name: "Albany Bread",
      barcode: "6001000000013",
      brand: "Albany",
      category: "Bread",
      reorderLevel: 10,
      onHand: 24,
      totalCost: 240
    },
    {
      name: "Coca-Cola 500ml",
      barcode: "5449000000996",
      brand: "Coca-Cola",
      category: "Cold Drinks",
      reorderLevel: 12,
      onHand: 40,
      totalCost: 280
    },
    {
      name: "Simba Chips 120g",
      barcode: "6009510800005",
      brand: "Simba",
      category: "Snacks",
      reorderLevel: 15,
      onHand: 18,
      totalCost: 162
    }
  ],
  sales: [],
  damages: [],
  sundry: [],
  notes: ""
};

const formatCurrency = (value) => `R${value.toFixed(2)}`;
const todayStamp = () => new Date().toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return structuredClone(initialData);
  }
  try {
    return JSON.parse(saved);
  } catch (error) {
    console.warn("Resetting invalid storage", error);
    return structuredClone(initialData);
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let state = loadData();

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2400);
};

const updateBrandOptions = () => {
  const brands = brandLibrary[state.storeType] || brandLibrary.other;
  brandSelect.innerHTML = brands
    .map((brand) => `<option value="${brand}">${brand}</option>`)
    .join("");
  brandHint.textContent = `Loaded ${brands.length} popular brands. Add a custom brand by editing the name field after selection.`;
};

const setStoreType = (type) => {
  state.storeType = type;
  updateBrandOptions();
  saveData(state);
  render();
};

const findProductByBarcode = (barcode) =>
  state.products.find((product) => product.barcode === barcode.trim());

const ensureProductExists = (barcode) => {
  const found = findProductByBarcode(barcode);
  if (found) return found;

  return {
    name: "Unregistered item",
    barcode: barcode.trim(),
    brand: "Unlisted",
    category: "Uncategorised",
    reorderLevel: 5,
    onHand: 0,
    totalCost: 0
  };
};

const addActivity = (message) => {
  state.sales.unshift({ activity: message, timestamp: todayStamp(), logOnly: true });
};

const calculateMetrics = () => {
  const totalSales = state.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const costOfSales = state.sales.reduce((sum, sale) => sum + (sale.cost || 0), 0);
  const damageCosts = state.damages.reduce((sum, entry) => sum + entry.cost, 0);
  const sundryCosts = state.sundry.reduce((sum, entry) => sum + entry.cost, 0);
  const grossProfit = totalSales - costOfSales;
  const totalCosts = damageCosts + sundryCosts;
  return {
    totalSales,
    grossProfit,
    totalCosts,
    netResult: grossProfit - totalCosts
  };
};

const renderInventory = () => {
  const rows = state.products
    .map((product) => {
      const avgCost = product.onHand ? product.totalCost / product.onHand : 0;
      return `
        <tr>
          <td>${product.name}</td>
          <td>${product.brand}</td>
          <td>${product.barcode}</td>
          <td>${product.onHand}</td>
          <td>${formatCurrency(avgCost)}</td>
        </tr>
      `;
    })
    .join("");
  inventoryTable.innerHTML = rows || "<tr><td colspan=\"5\">No stock captured yet.</td></tr>";

  const totalSkus = state.products.length;
  const totalUnits = state.products.reduce((sum, product) => sum + product.onHand, 0);
  const totalStockValue = state.products.reduce((sum, product) => sum + product.totalCost, 0);
  inventorySummary.innerHTML = `
    <div><strong>${totalSkus}</strong> SKUs tracked</div>
    <div><strong>${totalUnits}</strong> units on hand</div>
    <div><strong>${formatCurrency(totalStockValue)}</strong> stock cost value</div>
  `;

  const lowStockItems = state.products.filter((product) => product.onHand <= product.reorderLevel);
  lowStockList.innerHTML = lowStockItems
    .map((product) => `<li>${product.name} (${product.onHand} left)</li>`)
    .join("") || "<li>No low stock alerts right now.</li>";
};

const renderInsights = () => {
  const metrics = calculateMetrics();
  metricSales.textContent = formatCurrency(metrics.totalSales);
  metricProfit.textContent = formatCurrency(metrics.grossProfit);
  metricCosts.textContent = formatCurrency(metrics.totalCosts);
  metricNet.textContent = formatCurrency(metrics.netResult);

  const salesByProduct = state.sales
    .filter((sale) => !sale.logOnly)
    .reduce((acc, sale) => {
      acc[sale.product] = (acc[sale.product] || 0) + sale.quantity;
      return acc;
    }, {});

  const topItems = Object.entries(salesByProduct)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  topItemsList.innerHTML = topItems.length
    ? topItems.map(([name, qty]) => `<li>${name} - ${qty} sold</li>`).join("")
    : "<li>No sales yet. Scan items to see top sellers.</li>";

  const activity = state.sales.slice(0, 6);
  activityFeed.innerHTML = activity.length
    ? activity
        .map((entry) => `<li>${entry.activity || `${entry.product} (${entry.quantity})`} <span>${entry.timestamp}</span></li>`)
        .join("")
    : "<li>No activity yet.</li>";
};

const render = () => {
  storeTypeSelect.value = state.storeType;
  updateBrandOptions();
  renderInventory();
  renderInsights();
  notesField.value = state.notes || "";
};

const handleIntake = (event) => {
  event.preventDefault();
  const barcode = document.getElementById("intake-barcode").value.trim();
  const quantity = Number(document.getElementById("intake-qty").value);
  const cost = Number(document.getElementById("intake-cost").value);

  if (!barcode || quantity <= 0 || cost < 0) return;

  let product = findProductByBarcode(barcode);
  if (!product) {
    product = ensureProductExists(barcode);
    state.products.push(product);
  }

  product.onHand += quantity;
  product.totalCost += cost * quantity;

  addActivity(`Received ${quantity} units for barcode ${barcode}.`);
  saveData(state);
  render();
  intakeForm.reset();
  showToast("Stock added successfully.");
};

const handleSale = (event) => {
  event.preventDefault();
  const barcode = document.getElementById("sale-barcode").value.trim();
  const quantity = Number(document.getElementById("sale-qty").value);
  const price = Number(document.getElementById("sale-price").value);

  if (!barcode || quantity <= 0 || price < 0) return;

  let product = findProductByBarcode(barcode);
  if (!product) {
    showToast("Product not registered. Add it first.");
    return;
  }

  const avgCost = product.onHand ? product.totalCost / product.onHand : 0;
  const saleCost = avgCost * quantity;

  product.onHand = Math.max(product.onHand - quantity, 0);
  product.totalCost = Math.max(product.totalCost - saleCost, 0);

  state.sales.unshift({
    product: product.name,
    quantity,
    total: price * quantity,
    cost: saleCost,
    timestamp: todayStamp()
  });

  saveData(state);
  render();
  saleForm.reset();
  showToast("Sale recorded.");
};

const handleProductSubmit = (event) => {
  event.preventDefault();
  const name = document.getElementById("product-name").value.trim();
  const barcode = document.getElementById("product-barcode").value.trim();
  const brand = brandSelect.value;
  const category = document.getElementById("product-category").value.trim();
  const reorderLevel = Number(document.getElementById("product-reorder").value);

  if (!name || !barcode) return;

  const existing = findProductByBarcode(barcode);
  if (existing) {
    existing.name = name;
    existing.brand = brand;
    existing.category = category;
    existing.reorderLevel = reorderLevel;
  } else {
    state.products.push({
      name,
      barcode,
      brand,
      category,
      reorderLevel,
      onHand: 0,
      totalCost: 0
    });
  }

  addActivity(`Catalogued ${name} (${brand}).`);
  saveData(state);
  render();
  productForm.reset();
  productForm.classList.add("hidden");
  showToast("Product saved.");
};

const handleDamage = (event) => {
  event.preventDefault();
  const description = document.getElementById("damage-desc").value.trim();
  const cost = Number(document.getElementById("damage-cost").value);

  if (!description || cost <= 0) return;

  state.damages.unshift({ description, cost, timestamp: todayStamp() });
  addActivity(`Damage logged: ${description}.`);
  saveData(state);
  render();
  damageForm.reset();
  showToast("Damage logged.");
};

const handleSundry = (event) => {
  event.preventDefault();
  const description = document.getElementById("sundry-desc").value.trim();
  const cost = Number(document.getElementById("sundry-cost").value);

  if (!description || cost <= 0) return;

  state.sundry.unshift({ description, cost, timestamp: todayStamp() });
  addActivity(`Expense logged: ${description}.`);
  saveData(state);
  render();
  sundryForm.reset();
  showToast("Expense logged.");
};

storeTypeSelect.addEventListener("change", (event) => {
  setStoreType(event.target.value);
});

resetButton.addEventListener("click", () => {
  state = structuredClone(initialData);
  saveData(state);
  render();
  showToast("Demo data restored.");
});

addProductButton.addEventListener("click", () => {
  productForm.classList.toggle("hidden");
});

notesField.addEventListener("input", (event) => {
  state.notes = event.target.value;
  saveData(state);
});

intakeForm.addEventListener("submit", handleIntake);

saleForm.addEventListener("submit", handleSale);

productForm.addEventListener("submit", handleProductSubmit);

damageForm.addEventListener("submit", handleDamage);

sundryForm.addEventListener("submit", handleSundry);

render();
