const form = document.getElementById("form");
const searchForm = document.getElementById("search-bar-block");
const itemsContainer = document.getElementById("items-container");
const locationsContainer = document.getElementById("locations-container");
const locationSelection = document.getElementById("select-location_id");
const editItemContainer = document.getElementById("edit-item-container");
const searchResultsContainer = document.getElementById(
  "search-results-container"
);
const purchaseDate = document.getElementById("purchase_date");

// check if in devleopment
const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isDev ? "http://localhost:3000" : "http://ser6pro:3000";

// initialize purchase date
initializePurchaseDate();

document.addEventListener("DOMContentLoaded", async () => {
  // display fetched items
  displayFetchedData(
    `${API_BASE_URL}/api/v1/items`,
    [
      { name: "edit", emoji: "✏️" },
      { name: "delete", emoji: "🗑️" },
    ],
    itemsContainer
  );

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

  const url = `${API_BASE_URL}/api/v1/items`;

  const newlyAddedItem = await postNewData(url, payload);
  console.log("newlyAddedItem:", newlyAddedItem);

  displayFetchedData(
    `${API_BASE_URL}/api/v1/items`,
    [
      { name: "edit", emoji: "✏️" },
      { name: "delete", emoji: "🗑️" },
    ],
    itemsContainer
  );
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

  // alternate between which element is visible in the browser and which is hidden
  if (!document.getElementById("items-block").classList.contains("hide")) {
    document.getElementById("items-block").classList.add("hide");
  }

  if (!document.getElementById("edit-item-block").classList.contains("hide")) {
    document.getElementById("edit-item-block").classList.add("hide");
  }

  document.getElementById("search-results-block").classList.remove("hide");

  displayFetchedData(
    encodedURL,
    [
      { name: "edit", emoji: "✏️" },
      { name: "delete", emoji: "🗑️" },
    ],
    searchResultsContainer
  );
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

async function displayFetchedData(url, iconArray, parentElement) {
  parentElement.innerHTML = "";

  // fetch data that we want to display in the grid container
  const fetchedData = await fetchCurrentData(url);

  // generate headers
  const properties = Object.keys(fetchedData[0]);

  // we also need an array that describes the type of icons we expect to create for this project
  generateHeaders(properties, iconArray, parentElement);

  // fetchedData is an array
  // generate a row in the grid for each element within the fetchedData array
  // sort the array before creating grid items
  fetchedData
    .sort((a, b) => b.id - a.id)
    .map((item) =>
      generateGridRows(
        item,
        iconArray,
        parentElement,
        fetchedData[fetchedData.length - 1].id
      )
    );
}

function generateHeaders(properties, icons, parentElement) {
  properties.map((prop) => {
    let header = document.createElement("div");
    header.classList.add("header");
    header.setAttribute("id", `header-${prop}`);
    header.textContent = prop;
    parentElement.appendChild(header);
  });

  // create two empty rows (no header text, just empty divs)
  for (let i = 0; i < icons.length; i++) {
    let icon = icons[i];

    let emptyHeader = document.createElement("div");
    emptyHeader.classList.add("emptyHeader");
    emptyHeader.setAttribute("id", `header-${icon.name}`);
    emptyHeader.textContent = "";
    parentElement.appendChild(emptyHeader);
  }
}

function generateGridRows(object, icons, parentElement, idOfLastItem) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];

      let newElement = document.createElement("div");

      if (object.id === idOfLastItem) {
        newElement.classList.add("bottom-item");
      }

      newElement.setAttribute("id", `${object.id}-${key}`);
      newElement.textContent = element;
      parentElement.appendChild(newElement);
    }
  }
  generateIcons(icons, object.id, parentElement);
}

function generateIcons(icons, id, parentElement) {
  // create icons for each row in the grid
  for (let i = 0; i < icons.length; i++) {
    let icon = icons[i];

    let iconElement = document.createElement("i");
    iconElement.classList.add("icon");
    iconElement.setAttribute("id", `${id}-${icon.name}`);
    iconElement.textContent = icon.emoji;

    if (icon.name === "edit") {
      iconElement.addEventListener("click", async (event) => {
        const id = event.target.id.split("-")[0];

        // alternate between which element is visible in the browser and which is hidden
        document.getElementById("items-block").classList.add("hide");
        document.getElementById("edit-item-block").classList.remove("hide");

        editItemContainer.innerHTML = "";

        // find the item in the database
        const item = await fetchCurrentData(
          `${API_BASE_URL}/api/v1/items/${id}`
        );

        // lets get the names for the
        const keys = Object.keys(item);

        const icons = [
          { name: "save", emoji: "💾" },
          { name: "cancel", emoji: "❌" },
        ];

        // we also need an array that describes the type of icons we expect to create for this project
        generateHeaders(keys, icons, editItemContainer);

        // for each
        for (const key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            const value = item[key];

            let inputElement;

            if (key === "id") {
              inputElement = document.createElement("div");
              inputElement.textContent = value;
            } else {
              inputElement = document.createElement("input");
              inputElement.type = "text";
              inputElement.value = value;
              inputElement.placeholder = value;
            }
            inputElement.setAttribute("id", `${item.id}-${key}`);
            inputElement.classList.add("item-to-edit", "bottom-item");
            editItemContainer.append(inputElement);
          }
        }

        icons.forEach((icon) => {
          let iconElement = document.createElement("i");
          iconElement.classList.add("icon");
          iconElement.setAttribute("id", `${item.id}-${icon.name}`);
          iconElement.textContent = icon.emoji;

          if (icon.name === "save") {
            iconElement.addEventListener("click", async () => {
              const itemObj = {};
              const editedItem = [
                ...document.querySelectorAll(".item-to-edit"),
              ];

              editedItem.forEach((info) => {
                const prop = info.id.split("-")[1];

                if (prop !== "id") {
                  itemObj[prop] = info.value;
                }
              });

              const payload = JSON.stringify(itemObj);

              const id = editedItem[0].textContent;
              const url = `${API_BASE_URL}/api/v1/items/${id}`;

              const item = await editOneItem(url, payload);

              // alternate between which element is visible in the browser and which is hidden
              document.getElementById("items-block").classList.remove("hide");
              document.getElementById("edit-item-block").classList.add("hide");

              displayFetchedData(
                `${API_BASE_URL}/api/v1/items`,
                [
                  { name: "edit", emoji: "✏️" },
                  { name: "delete", emoji: "🗑️" },
                ],
                itemsContainer
              );
            });
          }

          if (icon.name === "cancel") {
            iconElement.addEventListener("click", () => {
              editItemContainer.innerHTML === "";

              document.getElementById("items-block").classList.remove("hide");
              document.getElementById("edit-item-block").classList.add("hide");

              // display fetched items
              displayFetchedData(
                `${API_BASE_URL}/api/v1/items`,
                [
                  { name: "edit", emoji: "✏️" },
                  { name: "delete", emoji: "🗑️" },
                ],
                itemsContainer
              );
            });
          }

          editItemContainer.append(iconElement);
        });
      });
    }

    if (icon.name === "delete") {
      iconElement.addEventListener("click", (event) => {
        const id = event.target.id.split("-")[0];

        // delete the item with the given id from the database
        deleteOneItem(`${API_BASE_URL}/api/v1/items/${id}`);

        // once item is deleted, re-render items
        displayFetchedData(
          `${API_BASE_URL}/api/v1/items`,
          [
            { name: "edit", emoji: "✏️" },
            { name: "delete", emoji: "🗑️" },
          ],
          itemsContainer
        );
      });
    }

    parentElement.appendChild(iconElement);
  }
}

async function editOneItem(url, payload) {
  const options = {
    method: "put",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
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
