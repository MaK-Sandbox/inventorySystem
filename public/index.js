const loadedDataContainer = document.getElementById("loaded-data-container");

document.addEventListener("DOMContentLoaded", renderGrid);

async function renderGrid() {
  const items = await fetchCurrentInventory();
  console.log("items", items);

  loadedDataContainer.innerHTML = "";

  // firstly, we need the headers
  generateHeaders(items[0]);

  // now let's get the data content
  if (Array.isArray(items) && items.length > 0) {
    items.map((item) => {
      // generate row data for each item and place them in the grid
      generateItemRow(item);

      // we also need to create the action buttons
      generateActionButton(item["id"], "editButton", "✏️");

      // we also need to create the action buttons
      generateActionButton(item["id"], "deleteButton", "❌");
    });
  }
}

function generateHeaders(item) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const header = document.createElement("div");
      header.classList.add("header");
      header.setAttribute("id", `header-${key}`);
      header.textContent = key;
      loadedDataContainer.appendChild(header);
    }
  }
  // create two empty headers
  for (let i = 0; i < 2; i++) {
    const emptyHeader = document.createElement("div");
    emptyHeader.classList.add("header");
    emptyHeader.setAttribute("id", "emptyHeader");
    emptyHeader.textContent = "";
    loadedDataContainer.appendChild(emptyHeader);
  }
}

function generateItemRow(item) {
  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      const value = item[key];

      // create a div element for each item info provided by the backend
      const itemInfo = document.createElement("div");
      itemInfo.classList.add("item");
      itemInfo.setAttribute("id", `${item["id"]}-${key}`);
      itemInfo.textContent = value;
      loadedDataContainer.appendChild(itemInfo);
    }
  }
}

function generateActionButton(itemId, buttonName, buttonIcon) {
  const button = document.createElement("i");
  button.classList.add("actionButton");
  button.setAttribute("id", `${itemId}-${buttonName}`);
  button.textContent = `${buttonIcon}`;

  // each action button should have an eventlistener for the event 'click'
  button.addEventListener("click", () => {
    if (buttonName === "editButton") {
      console.log(`You clicked an ${buttonName}`);
    }

    if (buttonName === "deleteButton") {
      console.log(`You clicked a ${buttonName}`);
    }
  });

  // finally, append action button to the desired parent element
  loadedDataContainer.appendChild(button);
}

async function fetchCurrentInventory() {
  const url = "http://127.0.0.1:3000/api/v1/items";

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}
