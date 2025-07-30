const form = document.getElementById("form");
const searchForm = document.getElementById("search-bar-block");
const itemsContainer = document.getElementById("items-container");
const locationsContainer = document.getElementById("locations-container");
const locationSelection = document.getElementById("select-location_id");
const purchaseDate = document.getElementById("purchase_date");

// check if in devleopment
const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isDev ? "http://localhost:3000" : "http://ser6pro:3000";

// initialize purchase date
initializePurchaseDate();

document.addEventListener("DOMContentLoaded", async () => {
  // display fetched items
  displayFetchedData(`${API_BASE_URL}/api/v1/items`);

  // display fetched locations
  const nestedHTML = await listLocations();
  locationsContainer.innerHTML = nestedHTML;

  // display location options in the location selection
  displayLocationSelection();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const dataObject = Object.fromEntries(formData);

  const payload = JSON.stringify(dataObject);
  console.log(payload);

  const url = `${API_BASE_URL}/api/v1/items`;

  const newObject = await postNewData(url, payload);
  console.log("newObject:", newObject);

  displayFetchedData(`${API_BASE_URL}/api/v1/items`);
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(searchForm);

  const dataObject = Object.fromEntries(formData);
  const dataArray = Object.entries(dataObject);

  const baseURL = `${API_BASE_URL}/search?`;
  const searchQuery = dataArray.map((set) => set.join("=")).join("&");

  const searchUrl = baseURL + searchQuery;
  const encodedURL = encodeURI(searchUrl.toLowerCase());

  const response = await fetchCurrentData(encodedURL);
  console.log("response", response);
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

async function listLocations() {
  locationsContainer.innerHTML = "";

  // fetch data that we want to display in the grid container
  const locations = await fetchCurrentData(`${API_BASE_URL}/api/v1/locations`);
  // console.log("locations:", locations);

  // Step 1: Create a map object. Use location id as keys and location objects as values.
  // Ensure to add a new property called children in the location objects which has an empty array as its value
  const map = new Map();
  locations.forEach((location) => {
    map.set(location.id, { ...location, children: [] });
  });

  // Step 2: Create an empty root array for top-level nodes
  const roots = [];

  // Step 3: Build the tree by linking children to their parent
  locations.forEach((location) => {
    if (location.parent_id === null) {
      roots.push(map.get(location.id));
    } else {
      const parent = map.get(location.parent_id);
      // map.get() will return undefined if the sought after value does not exist
      // if the parent exists, add the location.id of the child to the children array
      if (parent) {
        parent.children.push(map.get(location.id));
      }
    }
  });

  // Step 4: Recursively render the nested unordered list
  function renderList(locations) {
    let html = "<ul>";
    for (const location of locations) {
      html += `<li>id: ${location.id} - ${location.name}`;
      if (location.children.length > 0) {
        html += renderList(location.children);
      }
      html += "</li>";
    }
    html += "</ul>";
    return html;
  }

  // Step 5: Render the final html
  return renderList(roots);
}

async function displayLocationSelection() {
  locationSelection.innerHTML = "";

  // fetch data that we want to display in the grid container
  const locations = await fetchCurrentData(`${API_BASE_URL}/api/v1/locations`);

  locations.forEach((location) => {
    let option = document.createElement("option");
    option.classList.add("location-options");
    option.setAttribute("value", location.id);
    option.setAttribute("id", location.id);
    option.textContent = `id: ${location.id} - ${location.name}`;
    locationSelection.appendChild(option);
  });
}

async function displayFetchedData(url) {
  itemsContainer.innerHTML = "";

  // fetch data that we want to display in the grid container
  const fetchedData = await fetchCurrentData(url);

  // generate headers
  const properties = Object.keys(fetchedData[0]);

  // we also need an array that describes the type of icons we expect to create for this project
  const icons = ["edit", "delete"];

  generateHeaders(properties, icons);

  // fetchedData is an array
  // generate a row in the grid for each element within the fetchedData array
  // sort the array before creating grid items
  fetchedData
    .sort((a, b) => b.id - a.id)
    .map((item) => generateGridRows(item, icons));
}

function generateHeaders(properties, icons) {
  properties.map((prop) => {
    let header = document.createElement("div");
    header.classList.add("header");
    header.setAttribute("id", `header-${prop}`);
    header.textContent = prop;
    itemsContainer.appendChild(header);
  });

  // create two empty rows (no header text, just empty divs)
  for (let i = 0; i < icons.length; i++) {
    let icon = icons[i];

    let emptyHeader = document.createElement("div");
    emptyHeader.classList.add("emptyHeader");
    emptyHeader.setAttribute("id", `header-${icon}`);
    emptyHeader.textContent = "";
    itemsContainer.appendChild(emptyHeader);
  }
}

function generateGridRows(object, icons) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];

      let newElement = document.createElement("div");

      if (object.id === 1) {
        newElement.classList.add("bottom-item");
      }

      newElement.setAttribute("id", `${object.id}-${key}`);
      newElement.textContent = element;
      itemsContainer.appendChild(newElement);
    }
  }
  generateIcons(icons, object.id);
}

function generateIcons(icons, id) {
  // create icons for each row in the grid
  for (let i = 0; i < icons.length; i++) {
    let icon = icons[i];

    let iconElement = document.createElement("i");
    iconElement.classList.add("icon");
    iconElement.setAttribute("id", `${id}-${icon}`);

    if (icon === "edit") {
      iconElement.textContent = "✏️";
      iconElement.addEventListener("click", (event) => {
        const id = event.target.id.split("-")[0];

        console.log("id:", id);
        document.getElementById("items-block").classList.add("hide");
        document.getElementById("edit-item-container").classList.remove("hide");
      });
    }

    if (icon === "delete") {
      iconElement.textContent = "❌";
      iconElement.addEventListener("click", (event) => {
        const id = event.target.id.split("-")[0];

        // delete the item with the given id from the database
        deleteOneItem(`${API_BASE_URL}/api/v1/items/${id}`);

        // once item is deleted, re-render items
        displayFetchedData(`${API_BASE_URL}/api/v1/items`);
      });
    }

    itemsContainer.appendChild(iconElement);
  }
}

async function deleteOneItem(url) {
  const options = {
    method: "delete",
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

async function postNewData(url, payload) {
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
    return json;
  } catch (error) {
    console.error(error.message);
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
