const form = document.getElementById("form");
const itemsContainer = document.getElementById("items-container");

document.addEventListener("DOMContentLoaded", displayItems);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  const dataObject = Object.fromEntries(formData);

  const payload = JSON.stringify(dataObject);
  console.log(payload);

  const url = "http://localhost:3000/api/v1/items";
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://127.0.0.1",
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

async function displayItems() {
  itemsContainer.innerHTML = "";

  // fetch data that we want to display in x
  const items = await fetchCurrentItems();
  console.log("items", items);

  // generate headers
  const properties = Object.keys(items[0]);
  generateHeaders(properties);
}

function generateHeaders(properties) {
  properties.map((prop) => {
    let header = document.createElement("div");
    header.classList.add("header");
    header.setAttribute("id", `header-${prop}`);
    header.textContent = prop;
    itemsContainer.appendChild(header);
  });
}

async function fetchCurrentItems() {
  const url = "http://localhost:3000/api/v1/items";
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
