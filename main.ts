import "./style.css";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";
import * as OBCF from "@thatopen/components-front";

const container = document.getElementById("container")!;

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);

const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>();
world.scene = new OBC.SimpleScene(components);
world.renderer = new OBC.SimpleRenderer(components, container);
world.camera = new OBC.SimpleCamera(components);

components.init();
world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
world.scene.setup();
world.scene.three.background = null;

const grids = components.get(OBC.Grids);
grids.create(world);

const highlighter = components.get(OBCF.Highlighter);
highlighter.setup({ world });
highlighter.zoomToSelection = true;

let loadedModel: THREE.Object3D | null = null;

const fragments = components.get(OBC.FragmentsManager);
const fragmentIfcLoader = components.get(OBC.IfcLoader);
await fragmentIfcLoader.setup();
fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;

// Funkcja do ładowania modelu IFC z lokalnego urządzenia
async function loadIfc(file: File) {
  try {
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);

    const model = await fragmentIfcLoader.load(buffer);
    model.name = file.name;
    world.scene.three.add(model);

    loadedModel = model;
    console.log("Model IFC został załadowany:", model);
  } catch (error) {
    console.error("Błąd podczas ładowania modelu IFC:", error);
  }
}

// Funkcja do usuwania modelu
function unloadIfc() {
  if (loadedModel) {
    world.scene.three.remove(loadedModel);
    loadedModel = null;
    console.log("Model IFC został usunięty ze sceny.");
  }
}

// Obsługa kliknięcia na model
container.addEventListener("click", async (event) => {
  const intersects = highlighter.intersect(event);
  if (intersects && intersects.length > 0) {
    const selected = intersects[0];
    console.log("Wybrano element:", selected);
  }
});

const fileInput = document.getElementById("ifc-file-input")! as HTMLInputElement;
const loadIfcCheckbox = document.getElementById("load-ifc-checkbox")! as HTMLInputElement;

fileInput.addEventListener("change", () => {
  if (fileInput.files && fileInput.files.length > 0) {
    loadIfcCheckbox.disabled = false;
  } else {
    loadIfcCheckbox.disabled = true;
  }
});

loadIfcCheckbox.addEventListener("change", async (event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    await loadIfc(file);
  } else {
    unloadIfc();
  }
});

// Formularz kontaktowy i przycisk do pobrania danych
const contactForm = document.getElementById("contact-form")! as HTMLFormElement;
const downloadButton = document.getElementById("download-data")! as HTMLButtonElement;

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const firstName = (document.getElementById("first-name") as HTMLInputElement).value;
  const lastName = (document.getElementById("last-name") as HTMLInputElement).value;
  const phoneNumber = (document.getElementById("phone-number") as HTMLInputElement).value;

  if (!firstName || !lastName || !phoneNumber) {
    alert("Proszę wypełnić wszystkie pola.");
    return;
  }

  console.log("Dane kontaktowe:");
  console.log("Imię:", firstName);
  console.log("Nazwisko:", lastName);
  console.log("Numer telefonu:", phoneNumber);

  contactForm.reset();
  alert("Formularz został wysłany!");

  downloadButton.disabled = false;
  downloadButton.style.backgroundColor = "#004080";
  downloadButton.style.cursor = "pointer";
});




