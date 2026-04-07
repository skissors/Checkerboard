import { showTypes, personalityValues } from "./petHelperData.js";
import { loadWithExistingPetInfo, loadPetzCSVz } from "./petCsvLoader.js";
import { getPointsFromPlacement, getTitleFromPoints } from "../petzFunc.js";
import { loadPetData } from "./petDataLoader.js";

let curPet = null;

let petSelectionList = [];

let petData = loadWithExistingPetInfo();
setup();

function setup() {
	let filterId = "filter-select";
	for (let species in petData) {
		addOption("filter-species-select", species, species);

		addOption(filterId, species + "-all", species + " - all");
		for (let breed in petData[species]) {
			addOption(filterId, species + "-" + breed, species + " - " + breed);

			addOption("filter-breed-select", breed, breed);
		}
	}

	document.getElementById(filterId).addEventListener("change", (e) => {
		let parts = e.target.value.split("-");
		loadPetSelectionBox(parts[0], parts[1]);
	});

	document.getElementById("filter-text").addEventListener("change", (e) => {
		let text = e.target.value.toLowerCase();

		let matchingChildren = [];
		Array.from(document.getElementById("pet-box").childNodes).forEach((node) => {
			if (node.innerHTML.toLowerCase().includes(text)) matchingChildren.push(node);
		});

		document.getElementById("pet-box").innerHTML = "";
		matchingChildren.forEach((node) => {
			document.getElementById("pet-box").appendChild(node);
		});
	});

	setupNewShowEntryBox();

	keepDatalistOptions(".keepDatalist");

	document.getElementById("download-button").addEventListener("click", () => {
		let petdata = `export let petz_data = ${JSON.stringify(petData)}`;
		download(petdata, "petz.js", "text/plain");
	});
	resetPetInfo();
}

function setupNewShowEntryBox() {
	let firstType;
	for (let s in showTypes) {
		if (!firstType) firstType = s;
		addOption("showTypes-data", s);
	}
	for (let p in showTypes[firstType]) {
		addOption("showPlacement-data", showTypes[firstType][p]);
	}

	document.getElementById("showTypes-data").onchange = (e) => {
		let type = e.target.value;

		document.getElementById("showPlacement-data").innerHTML = "";
		for (let p in showTypes[type]) {
			addOption("showPlacement-data", showTypes[type][p]);
		}
	};

	document.getElementById("add-show-entry").onclick = (e) => {
		let type = document.getElementById("showTypes-data").value;
		let placement = document.getElementById("showPlacement-data").value;
		let title = document.getElementById("showTitle-input").value;
		let url = document.getElementById("showUrl-input").value;

		if (!curPet.show_records) curPet.show_records = {};
		if (!curPet.show_records[type]) {
			curPet.show_records[type] = [];
			curPet.show_points[type] = 0;
		}

		let showObj = {};
		showObj.placement = placement;
		showObj.name = title;
		if (url) showObj.url = url;

		curPet.show_records[type].push(showObj);
		curPet.show_points[type] += getPointsFromPlacement(placement, type);
		loadPetShowData(curPet);
	};
}

function loadPetSelectionBox(species, breed) {
	document.getElementById("pet-box").innerHTML = "";

	if (species === "all") {
		for (let s in petData) {
			loadSelectionBreed(s, breed);
		}
	} else loadSelectionBreed(species, breed);

	function loadSelectionBreed(species, breed) {
		if (breed === "all") {
			for (let b in petData[species]) {
				loadSelectionPet(species, b);
			}
		} else loadSelectionPet(species, breed);
	}

	function loadSelectionPet(species, breed) {
		for (let entry in petData[species][breed]) {
			let pet = petData[species][breed][entry];
			let petButton = document.createElement("div");
			petButton.innerHTML = species + " - " + breed + " - " + pet.name;

			let mismatch = false;
			for (let v in pet.csvData) {
				if (v != "newlyAdded" && pet[v] != pet.csvData[v]) {
					mismatch = true;
					break;
				}
			}

			if (mismatch) petButton.classList.add("mismatch");

			if (pet.csvData.newlyAdded) petButton.classList.add("new");

			petButton.addEventListener("click", () => {
				loadPetData(pet.name, petData);
			});
			document.getElementById("pet-box").appendChild(petButton);
		}
	}
}

function addOption(id, value, text) {
	let option = document.createElement("option");
	option.value = value;
	if (!text) text = value;
	option.innerHTML = text;

	document.getElementById(id).appendChild(option);
}

function keepDatalistOptions(selector = "") {
	// select all input fields by datalist attribute or by class/id
	selector = !selector ? "input[list]" : selector;
	let datalistInputs = document.querySelectorAll(selector);
	if (datalistInputs.length) {
		for (let i = 0; i < datalistInputs.length; i++) {
			let input = datalistInputs[i];
			input.addEventListener("input", function (e) {
				e.target.setAttribute("placeholder", e.target.value);
				e.target.blur();
			});
			input.addEventListener("focus", function (e) {
				e.target.setAttribute("placeholder", e.target.value);
				e.target.value = "";
			});
			input.addEventListener("blur", function (e) {
				e.target.value = e.target.getAttribute("placeholder");
			});
		}
	}
}

function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}

