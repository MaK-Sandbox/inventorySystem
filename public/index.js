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
  displayFetchedData(itemsContainer, `${API_BASE_URL}/api/v1/items`);
  displayFetchedData(locationsContainer, `${API_BASE_URL}/api/v1/locations`);
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

  displayFetchedData(itemsContainer, `${API_BASE_URL}/api/v1/items`);
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

async function displayFetchedData(gridContainer, url) {
  gridContainer.innerHTML = "";

  // fetch data that we want to display in the grid container
  const fetchedData = await fetchCurrentData(url);
  console.log("fetchedData:", fetchedData);

  // generate headers
  const properties = Object.keys(fetchedData[0]);
  generateHeaders(properties, gridContainer);

  // fetchedData is an array
  // generate a row in the grid for each element within the fetchedData array
  // penending on the grid container, sort the array before creating grid items
  if (gridContainer === itemsContainer) {
    fetchedData
      .sort((a, b) => b.id - a.id)
      .map((item) => generateGridRows(fetchedData, item, gridContainer, true));
  }

  if (gridContainer === locationsContainer) {
    fetchedData
      .sort()
      .map((location) =>
        generateGridRows(fetchedData, location, gridContainer)
      );
  }
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

function generateGridRows(array, object, parentElement, reverseOrder = false) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];

      let newElement = document.createElement("div");

      if (!reverseOrder) {
        if (object.id === array.length) {
          newElement.classList.add("bottom-item");
        }
      } else {
        if (object.id === 1) {
          newElement.classList.add("bottom-item");
        }
      }
      newElement.setAttribute("id", `${object.id}-${key}`);
      newElement.textContent = element;
      parentElement.appendChild(newElement);
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
