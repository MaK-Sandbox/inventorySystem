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
  generateHeading("Items");

  // fetch current items in the inventory from the backend
  const items = await getItems(`${API_BASE_URL}/api/v1/items`);

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

addItemBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  // create h1-heading
  generateHeading("Add item");
});

documentsBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  // create h1-heading
  generateHeading("Documents");

  // create an element with id add_items_form and begin to add children to it
  const addItemForm = document.createElement("form");
  addItemForm.setAttribute("id", "add_items_form");
  addItemForm.setAttribute("method", "post");
  addItemForm.setAttribute("enctype", "multipart/form-data");
  addItemForm.setAttribute("action", "/api/v1/documents/upload");
  mainContent.appendChild(addItemForm);

  // add content for #add_items_form
  const label = document.createElement("label");
  label.textContent = "Upload file:";
  label.setAttribute("for", "file");
  addItemForm.appendChild(label);

  const inputTypeFile = document.createElement("input");
  inputTypeFile.setAttribute("type", "file");
  inputTypeFile.setAttribute("id", "file");
  inputTypeFile.setAttribute("name", "file");
  inputTypeFile.setAttribute("multiple", true);
  addItemForm.appendChild(inputTypeFile);

  const inputTypeSubmit = document.createElement("input");
  inputTypeSubmit.setAttribute("type", "submit");
  inputTypeSubmit.value = "Submit";
  addItemForm.appendChild(inputTypeSubmit);
});

function generateGridElements(itemObj, parentElement) {
  for (const key in itemObj) {
    if (Object.prototype.hasOwnProperty.call(itemObj, key)) {
      const value = itemObj[key];

      const gridElement = document.createElement("div");
      gridElement.setAttribute("id", `${itemObj.id}-${key}`);
      gridElement.textContent = value;
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

function generateHeading(text) {
  const h1 = document.createElement("h1");
  h1.classList.add("h1-heading");
  h1.textContent = text;
  mainContent.appendChild(h1);
}

async function getItems(url) {
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
