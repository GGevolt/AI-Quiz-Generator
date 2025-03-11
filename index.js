// LOAD COMPONENT TO INDEX.HTML
async function loadComponent(id, file) {
  const res = await fetch(file);
  const text = await res.text();
  document.getElementById(id).innerHTML = text;
  document.dispatchEvent(new Event("componentLoaded")); // Dispatch custom event
}

// If want to import any file, please import here -.-

loadComponent("homepage", "src/components/HomePage/homepage.html");
//----//
