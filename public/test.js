console.log("Hello World!");
// get buttons by id
const itemsBtn = document.getElementById("items_btn");
const addItemBtn = document.getElementById("add_item_btn");
const documentsBtn = document.getElementById("documents_btn");

// check if in devleopment
const isDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isDev ? "http://localhost:3000" : "http://ser6pro:3000";

// get #main_content
const mainContent = document.getElementById("main_content");

// show by default when page loads for the first time
window.addEventListener("load", () => {
  mainContent.textContent = "I just loaded!";
});

// create event hadnlers for each button
itemsBtn.addEventListener("click", async () => {
  mainContent.innerHTML = "";

  // create h1-heading
  generateHeading("Current items", mainContent);

  // fetch current items in the inventory from the backend
  const items = await getData(`${API_BASE_URL}/api/v1/items`);

  // create an element with id items_container and begin to add children to it
  const gridContainer = document.createElement("div");
  gridContainer.setAttribute("id", "items_container");

  // check if items is undefined
  if (items.length < 1) {
    gridContainer.textContent = "No items found";
  } else {
    // get the properties/keys from the first object in the items array
    const keys = Object.keys(items[0]);

    // for each key, generate a grid element
    if (keys.length > 0) {
      generateHeaders(keys, gridContainer);
    }

    // next, generate grid data rows
    items
      .sort((a, b) => b.id - a.id)
      .forEach((item) => {
        generateGridElements(item, gridContainer);
      });
  }

  mainContent.appendChild(gridContainer);
});

addItemBtn.addEventListener("click", async () => {
  mainContent.innerHTML = "";

  // the page will consist of two components that should ideally be placed side by side
  // therefore we need a flex-container
  const flexContainer = document.createElement("div");
  flexContainer.setAttribute("id", "flex_container");
  mainContent.appendChild(flexContainer);

  // the first child component that we want inside of #flex_container is a form element
  const addItemsForm = document.createElement("form");
  addItemsForm.setAttribute("id", "add_items_form");
  addItemsForm.setAttribute("method", "post");
  addItemsForm.setAttribute("action", "");
  flexContainer.appendChild(addItemsForm);

  // add an h1-heading
  generateHeading("Add a new item", addItemsForm);

  // create a grid container for label and input pairs inside of #add_items_form
  const gridContainer = document.createElement("div");
  gridContainer.setAttribute("id", "form_grid");
  addItemsForm.appendChild(gridContainer);

  // lets add content to the form element
  generateLabelInputPairs("name", "Name:", "text", "Desk Chair", gridContainer);
  generateLabelInputPairs(
    "quantity",
    "Quantity:",
    "number",
    "1",
    gridContainer
  );
  generateLabelInputPairs(
    "location_id",
    "Location id:",
    "number",
    "1",
    gridContainer
  );
  generateLabelInputPairs(
    "purchase_price",
    "Purchase prise:",
    "number",
    "50",
    gridContainer
  );
  generateLabelInputPairs(
    "currency_id",
    "Currency id:",
    "number",
    "1",
    gridContainer
  );
  generateLabelInputPairs(
    "purchase_date",
    "Purchase date:",
    "text",
    "",
    gridContainer
  );
  generateLabelInputPairs(
    "freeText",
    "Free text:",
    "text",
    "optional: add text here",
    gridContainer
  );

  // we also want a grid container where new items can be listed as they are added to the inventory
  const newlyAddedItemsContainer = document.createElement("div");
  newlyAddedItemsContainer.setAttribute("id", "new_added_items_container");
  mainContent.appendChild(newlyAddedItemsContainer);

  // lets store newly added items, just temporarily
  const newlyAddedItems = [];

  // lastly, create a submit button
  const submitBtn = document.createElement("input");
  submitBtn.setAttribute("id", "submit_item_btn");
  submitBtn.setAttribute("type", "submit");
  submitBtn.value = "Add item ➕";
  submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const formData = new FormData(addItemsForm);
    const dataObject = Object.fromEntries(formData);
    const payload = JSON.stringify(dataObject);

    const url = `${API_BASE_URL}/api/v1/items`;
    const newItem = await postData(url, payload);
    newlyAddedItems.push(newItem);

    // in case that our newlyAddedItems array only consists of one item, generate headers also
    if (newlyAddedItems.length === 1) {
      const keys = Object.keys(newItem);
      generateHeaders(keys, newlyAddedItemsContainer);
    }

    // add the new item to newlyAddedItemsContainer
    generateGridElements(newItem, newlyAddedItemsContainer);
  });
  addItemsForm.appendChild(submitBtn);

  // lastly, we want to list the locations available as the second component in #flex_container
  const locationsContainer = document.createElement("div");
  locationsContainer.setAttribute("id", "locations_list");
  flexContainer.appendChild(locationsContainer);

  // add an h1-heading
  generateHeading("List of locations", locationsContainer);

  // list locations currently existing in the backend
  const nestedHTML = await listLocations();
  locationsContainer.innerHTML += nestedHTML;
});

documentsBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  // create h1-heading
  generateHeading("Add a new document", mainContent);

  // create an element with id add_docs_form and begin to add children to it
  const addDocForm = document.createElement("form");
  addDocForm.setAttribute("id", "add_docs_form");
  addDocForm.setAttribute("method", "post");
  addDocForm.setAttribute("enctype", "multipart/form-data");
  addDocForm.setAttribute("action", "/api/v1/documents/upload");
  mainContent.appendChild(addDocForm);

  const formGrid = document.createElement("div");
  formGrid.setAttribute("id", "form_grid");
  addDocForm.appendChild(formGrid);

  // add content for #add_items_form
  const label = document.createElement("label");
  label.textContent = "Upload file:";
  label.setAttribute("for", "file");
  formGrid.appendChild(label);

  const inputTypeFile = document.createElement("input");
  inputTypeFile.setAttribute("type", "file");
  inputTypeFile.setAttribute("id", "file");
  inputTypeFile.setAttribute("name", "file");
  inputTypeFile.setAttribute("multiple", true);
  formGrid.appendChild(inputTypeFile);

  const inputTypeSubmit = document.createElement("input");
  inputTypeSubmit.setAttribute("type", "submit");
  inputTypeSubmit.value = "Submit";
  addDocForm.appendChild(inputTypeSubmit);
});

function generateLabelInputPairs(name, text, type, placeholder, parentElement) {
  const label = document.createElement("label");
  label.setAttribute("for", name);
  label.textContent = text;
  parentElement.appendChild(label);

  const input = document.createElement("input");

  if (name === "purchase_date") {
    input.value = initializePurchaseDate();
  }

  input.setAttribute("id", name);
  input.setAttribute("name", name);
  input.setAttribute("type", type);
  input.setAttribute("placeholder", placeholder);
  parentElement.appendChild(input);
}

function initializePurchaseDate() {
  const d = new Date();
  let year = d.getFullYear();
  let month = addZero(d.getMonth() + 1);
  let date = addZero(d.getDate());
  let hour = addZero(d.getHours());
  return `${year}-${month}-${date} ${hour}:00:00`;
}

function addZero(i) {
  if (i < 10) return `0${i}`;
  return i;
}

async function listLocations() {
  // fetch data that we want to display in the grid container
  const locations = await getData(`${API_BASE_URL}/api/v1/locations`);

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

function generateGridElements(itemObj, parentElement) {
  for (const key in itemObj) {
    if (Object.prototype.hasOwnProperty.call(itemObj, key)) {
      const value = itemObj[key];

      const gridElement = document.createElement("div");
      gridElement.setAttribute("id", `${itemObj.id}-${key}`);

      if (key === "purchase_price") {
        gridElement.textContent = value.toLocaleString("de-DE");
      } else {
        gridElement.textContent = value;
      }
      parentElement.appendChild(gridElement);
    }
  }
}

function generateHeaders(arrayOfHeaderTitles, parentElement) {
  // generate a header element for each
  arrayOfHeaderTitles.forEach((headerTitle) => {
    const gridHeader = document.createElement("div");
    gridHeader.setAttribute("id", `header-${headerTitle}`);
    gridHeader.textContent = headerTitle;
    parentElement.appendChild(gridHeader);
  });
}

function generateHeading(text, parentElement) {
  const h1 = document.createElement("h1");
  h1.classList.add("h1-heading");
  h1.textContent = text;
  parentElement.appendChild(h1);
}

async function postData(url, payload) {
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

async function getData(url) {
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
