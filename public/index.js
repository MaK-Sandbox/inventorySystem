const loadedDataContainer = document.getElementById("loaded-data-container");

document.addEventListener("DOMContentLoaded", occupyDataContainer);

function occupyDataContainer() {
  const data = fetchCurrentInventory();

  loadedDataContainer.innerHTML = "";
  loadedDataContainer.textContent = data;
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
    console.log("json", json);
  } catch (error) {
    console.error(error.message);
  }
}
