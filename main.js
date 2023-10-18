const main = document.querySelector("main");
const input = main.querySelector("input");

input.addEventListener("change", event => {
  handleFileChange(event.currentTarget.files[0]);
});

const reader = new FileReader();

function handleFileChange(file) {
  reader.onload = event => {
    try {
      const json = JSON.parse(event.currentTarget.result);
      removeAll();
      renderTitle(file.name);
      renderData(json, main);
    } catch (error) {
      renderError();
    }
  };
  reader.readAsText(file);
}

function renderError() {
  const renderedErrorMessage = document.getElementById("error-message");
  if (renderedErrorMessage != null) return;

  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
  errorMessage.setAttribute("id", "error-message");
  main.appendChild(errorMessage);
}

function removeAll() {
  while (main.firstChild != null) main.removeChild(main.firstChild);
}

function renderTitle(filename) {
  const title = document.createElement("h1");
  title.textContent = filename;
  title.setAttribute("id", "file-title");
  main.appendChild(title);
}

function renderData(data, parent) {
  if (isObject(data)) {
    renderList(data, parent);
  } else {
    renderSpan(` ${data}`, parent, "value-span");
  }
}

function renderList(data, parent) {
  const tag = Array.isArray(data) ? "ol" : "ul";
  const list = document.createElement(tag);
  parent.appendChild(list);
  for (const property in data) renderLi(property, data[property], list);
}

function renderLi(property, value, parent) {
  const li = document.createElement("li");
  parent.appendChild(li);
  const inOrderedList = parent.tagName === "OL";
  const propertyClass = inOrderedList ? "number-span" : "name-span";
  const propertySpan = renderSpan(`${property}:`, li, propertyClass);
  if (inOrderedList && isObject(value)) {
    const valueSpan = renderSpan(` [+]`, li, "collapsed");
    propertySpan.addEventListener("click", () => {
      expand(valueSpan, li, value);
    });
    valueSpan.addEventListener("click", () => {
      expand(valueSpan, li, value);
    });
  } else {
    renderData(value, li);
  }
}

function renderSpan(text, parent, spanClass) {
  const span = document.createElement("span");
  span.textContent = text;
  span.setAttribute("class", spanClass);
  parent.appendChild(span);
  return span;
}

function isObject(data) {
  return data != null && typeof data === "object";
}

function expand(span, parent, data) {
  parent.removeChild(span);
  renderData(data, parent);
}
