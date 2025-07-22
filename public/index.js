const form = document.getElementById("form");
const itemsContainer = document.getElementById("items-container");
const locationsContainer = document.getElementById("locations-container");
const purchaseDate = document.getElementById("purchase_date");

// check if in devleopment
const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isDev ? "http://localhost:3000" : "http://ser6pro:3000";

// initialize purchase date
initializePurchaseDate();

document.addEventListener("DOMContentLoaded", () => {
  displayItems();
  displayLocations();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const dataObject = Object.fromEntries(formData);

  const payload = JSON.stringify(dataObject);
  console.log(payload);

  const url = `${API_BASE_URL}/api/v1/items`;
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: payload,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }

  displayItems();
});

function initializePurchaseDate() {
  const d = new Date();
  let year = d.getFullYear();
  let month = addZero(d.getMonth() + 1);
  let date = addZero(d.getDate());
  let hour = addZero(d.getHours());
  purchaseDate.value = `${year}-${month}-${date} ${hour}:00:00`;
}

function addZero(i) {
  if (i < 10) return `0${i}`;
  return i;
}

async function displayLocations() {
  locationsContainer.innerHTML = "";

  // fetch data that we want to display in #locations-container
  const locations = await fetchCurrentData(`${API_BASE_URL}/api/v1/locations`);
  console.log("locations", locations);

  // generate headers
  const properties = Object.keys(locations[0]);
  generateHeaders(properties, locationsContainer);

  // generate a row in the grid for each location
  locations
    .sort()
    .map((location) => generateGridRows(location, locationsContainer));
}

async function displayItems() {
  itemsContainer.innerHTML = "";

  // fetch data that we want to display in #items-container
  const items = await fetchCurrentData(`${API_BASE_URL}/api/v1/items`);
  console.log("items", items);

  // generate headers
  const properties = Object.keys(items[0]);
  generateHeaders(properties, itemsContainer);

  // generate item rows
  items
    .sort((a, b) => b.id - a.id)
    .map((item) => generateGridRows(item, itemsContainer));
}

function generateHeaders(properties, parentElement) {
  properties.map((prop) => {
    let header = document.createElement("div");
    header.classList.add("header");
    header.setAttribute("id", `header-${prop}`);
    header.textContent = prop;
    parentElement.appendChild(header);
  });
}

function generateGridRows(item, parentElement) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const element = item[key];

      let itemInfo = document.createElement("div");
      itemInfo.classList.add("item-info");
      if (item.id === 1) {
        itemInfo.classList.add("bottom-item");
      }
      itemInfo.setAttribute("id", `${item.id}-${key}`);
      itemInfo.textContent = element;
      parentElement.appendChild(itemInfo);
    }
  }
}

async function fetchCurrentData(url) {
  const options = {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}
