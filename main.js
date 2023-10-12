const heading = document.querySelector("h1");
const subtitle = document.querySelector("p");
const button = document.querySelector("label");
const input = document.querySelector("input");
const elements = [heading, subtitle, button, input];

input.addEventListener("change", event => {
  handleFileChange(event.currentTarget.files[0]);
});

const reader = new FileReader();

function handleFileChange(file) {
  reader.onload = event => {
    let json;
    let invalidJson = false;
    const string = event.currentTarget.result;
    try {
      json = JSON.parse(string);
    } catch (error) {
      invalidJson = true;
    }
    if (invalidJson) {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
      errorMessage.setAttribute("id", "error-message");
      document.body.appendChild(errorMessage);
    } else {
      removeAll();
      renderTitle(file.name);
      renderData(json);
    }
  };
  reader.readAsText(file);
}

function removeAll() {
  for (const element of elements) element.remove();
}

function renderTitle(filename) {
  const title = document.createElement("h1");
  title.textContent = filename;
  document.body.appendChild(title);
}

function renderData(data) {
  if (Array.isArray(data)) {
    renderArray(data, document.body);
  } else if (typeof data == "object") {
    renderObject(data, document.body);
  }
}

function renderArray(data, parent) {
  const ol = document.createElement("ol");
  parent.appendChild(ol);
  const li = document.createElement("li");
  ol.appendChild(li);
  for (const element of data) {
    if (Array.isArray(element)) {
      renderArray(element, li);
    } else if (typeof element === "object") {
      renderObject(element, li);
    } else {
      li.textContent = String(element);
    }
  }
}

function renderObject(data, parent) {
  const dl = document.createElement("dl");
  parent.appendChild(dl);
  for (const key in data) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    dl.appendChild(dt);
    const dd = document.createElement("dd");
    dl.appendChild(dd);
    if (Array.isArray(data[key])) {
      renderArray(data[key], dd);
    } else if (typeof data[key] === "object") {
      renderObject(data[key], dd);
    } else {
      dd.textContent = String(data[key]);
    }
  }
}
