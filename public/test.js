console.log("Hello World!");
// get buttons by id
const itemsBtn = document.getElementById("items_btn");
const addItemBtn = document.getElementById("add_item_btn");
const documentsBtn = document.getElementById("documents_btn");

// get #main_content
const mainContent = document.getElementById("main_content");

// show by default when page loads for the first time
window.addEventListener("load", (event) => {
  mainContent.textContent = "I just loaded!";
});

// create event hadnlers for each button
itemsBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  mainContent.textContent = "Items";
});

addItemBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  mainContent.textContent = "Add item";
});

documentsBtn.addEventListener("click", () => {
  mainContent.innerHTML = "";

  mainContent.textContent = "Documents";
});
