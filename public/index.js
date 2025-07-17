const loadedDataContainer = document.getElementById("loaded-data-container");
const buttonContainer = document.getElementById("btn-container");

renderGrid();

generateButton("Add item ➕");

function generateButton(textContent) {
  // create button
  buttonContainer.innerHTML = "";

  const button = document.createElement("button");
  button.classList.add("button");
  button.innerText = textContent;

  button.addEventListener("click", () => {
    if (textContent === "Add item ➕") {
      for (let i = 0; i < 8; i++) {
        if (i === 0) {
          const emptyDiv = document.createElement("div");
          emptyDiv.classList.add("emptyDiv");
          loadedDataContainer.appendChild(emptyDiv);
        } else {
          const emptyInput = document.createElement("input");
          emptyInput.classList.add("emptyInput");
          loadedDataContainer.appendChild(emptyInput);
        }
      }

      generateButton("Save 💾");
    }

    if (textContent === "Save 💾") {
      const allInput = [...document.querySelectorAll(".emptyInput")];

      const obj = {
        name: allInput[0].value,
        quantity: allInput[1].value,
        location_id: allInput[2].value,
        purchase_price: allInput[3].value,
        currency_id: allInput[4].value,
        purchase_date: allInput[5].value,
        freeText: allInput[6].value,
      };

      // send to backend via fetch
      if (saveNewItem(obj)) {
        renderGrid();
        generateButton("Add item ➕");
      }
    }
  });

  buttonContainer.appendChild(button);
}

async function saveNewItem(obj) {
  const url = "http://127.0.0.1:3000/api/v1/items";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

async function renderGrid() {
  const items = await fetchCurrentInventory();
  console.log("items", items);

  loadedDataContainer.innerHTML = "";

  if (!items) {
    generateHeaders({
      id: 1,
      name: "Desk chair",
      quantity: 3,
      location_id: 1,
      purchase_price: 300,
      currency_id: 1,
      purchase_date: "2025-07-07 10:00:00",
      freeText: "Office equipment",
    });
  }

  // now let's get the data content
  if (Array.isArray(items) && items.length > 0) {
    // firstly, we need the headers
    generateHeaders(items[0]);

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
    return json || [];
  } catch (error) {
    console.error("Network or parsing error:", error);
    return null;
  }
}
