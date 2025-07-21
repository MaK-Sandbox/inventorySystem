const form = document.getElementById("form");

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
});
