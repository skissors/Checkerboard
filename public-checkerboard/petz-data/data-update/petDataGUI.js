import { showTypes } from "./petHelperData.js";
import { loadWithExistingPetInfo, loadPetzCSVz } from "./petCsvLoader.js";
import { cleanName } from "../../checkerboard/scripts/utilities.js";
import { getPointsFromPlacement, getTitleFromPoints } from "../petzFunc.js";

let curPet = null;


let petData = loadWithExistingPetInfo();
setup();


function setup() {
	let filterId = "filter-select";
	for (let species in petData) {
		addOption(filterId, species + "-all", species + " - all");
		for (let breed in petData[species]) {
			addOption(filterId, species + "-" + breed, species + " - " + breed);
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
		let petdata = `export let petz_data = ${JSON.stringify(petData)}`
		download(petdata, "petz.js", "text/plain");
	});
	resetPetInfo();
}

function setupNewShowEntryBox() {
    let firstType;
	for (let s in showTypes) {
        if (!firstType) firstType = s
		addOption("showTypes-data", s);
	}
    for (let p in showTypes[firstType]) {
        addOption("showPlacement-data", showTypes[firstType][p]);
    }

	document.getElementById("showTypes-data").onchange = (e) => {
		let type = e.target.value

		document.getElementById("showPlacement-data").innerHTML = "";
		for (let p in showTypes[type]) {
			addOption("showPlacement-data", showTypes[type][p]);
		}
	}

	document.getElementById("add-show-entry").onclick = (e) => {
		let type = document.getElementById("showTypes-data").value;
		let placement = document.getElementById("showPlacement-data").value;
		let title = document.getElementById("showTitle-input").value;
		let url = document.getElementById("showUrl-input").value;

		if (!curPet.show_records) curPet.show_records = {}
		if (!curPet.show_records[type]) {
			curPet.show_records[type] = [];
			curPet.show_points[type] = 0;
		}

		let showObj = {};
		showObj.placement = placement;
		showObj.name = title;
		if(url) showObj.url = url;

		curPet.show_records[type].push(showObj);
		curPet.show_points[type] += getPointsFromPlacement(placement, type);
		loadPetShowData(curPet)
	}

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

            if(mismatch) petButton.classList.add("mismatch")

			if(pet.csvData.newlyAdded) petButton.classList.add("new")

			petButton.addEventListener("click", () => {
				loadPetData(pet.name, petData);
			});
			document.getElementById("pet-box").appendChild(petButton);
		}
	}
}

function loadPetData(name, data) {
	resetPetInfo();
	let pet = getPetByName(name, data);
    curPet = pet;
    console.log(pet);

	document.getElementById("pet-image").src = `..\\petz\\${pet.species}\\${pet.breed}\\${cleanName(pet.name)}\\${cleanName(pet.name)}.png`;
	document.getElementById("main-name").innerHTML = pet.displayName ? petdisplayName : pet.name;

	for (let p in pet) {
		if (document.getElementById(p)) document.getElementById(p).innerHTML = pet[p];
		if (document.getElementById(p + "-input"))  {
            document.getElementById(p + "-input").value = pet[p];
            document.getElementById(p + "-input").onchange = (e) => {
                pet[p] = e.target.value;
            }
        }          
		if (document.getElementById(p + "-select")) {    
            document.getElementById(p + "-select").value = pet[p];
            document.getElementById(p + "-select").onchange = (e) => {
                pet[p] = e.target.value;
            }
        }
	}

	document.getElementById("pedigree-cbs").querySelectorAll('input[type=checkbox]').forEach((i) =>{
		let id = i.id.split("-")[0]
		if(id === "nib") {
			i.checked = !pet.pedigree.inbred;
			i.onchange = (e) => { pet.pedigree.inbred = e.target.checked}
		}
		else {
			i.checked = pet.pedigree[id];
			i.onchange = (e) => { pet.pedigree[id] = e.target.checked}
		}
	});

	for (let c in pet.csvData) {
		if (document.getElementById("csv-" + c)) document.getElementById("csv-" + c).innerHTML = pet.csvData[c];
	}

	for (let o in pet.origin) {
		if (document.getElementById("origin-" + o)) document.getElementById("origin-" + o).innerHTML = pet.origin[o];
	}

	loadPetShowData(pet);
}

function loadPetShowData(pet) {
	console.log("loading show data")
	console.log(pet);
	document.getElementById("show-image").src = `..\\petz\\${pet.species}\\${pet.breed}\\${cleanName(pet.name)}\\${cleanName(pet.name)}-pose.png`;

	let firstRecord = document.getElementById("showRecord-select").value;
	if(!pet.show_records || !pet.show_records[firstRecord]) firstRecord = null;
	document.getElementById("showRecord-select").innerHTML = "";
	console.log(firstRecord)
	for (let r in pet.show_records) {
		if (!firstRecord || firstRecord === "") firstRecord = r;
		addOption("showRecord-select", r);
	}
	document.getElementById("showRecord-select").onchange = (e) => {
		loadShowRecords(e.target.value, pet);
	};

	document.getElementById("showRecord-select").value = firstRecord

    if (pet.show_points) {
        document.getElementById("tPoints").innerHTML = pet.show_points["Pose Shows"];
        document.getElementById("tTitle").innerHTML = getTitleFromPoints(pet.show_points["Pose Shows"], "Pose Shows", "cat");
    }
	loadShowRecords(firstRecord, pet);
}

function loadShowRecords(type, pet) {
    if (pet.show_points && pet.show_points[type]) {
        document.getElementById("tyPoints").innerHTML = pet.show_points[type];
        document.getElementById("tyTitle").innerHTML = getTitleFromPoints(pet.show_points[type], type, "cat");
    }
    else {
        document.getElementById("tyPoints").innerHTML = "";
        document.getElementById("tyTitle").innerHTML = "";
    }

	document.getElementById("showRecord-entires").innerHTML = null;
	if (pet.show_records && pet.show_records[type]) {
		for (let s in pet.show_records[type]) {
			let entry = document.createElement("div");
			let placement = pet.show_records[type][s].placement;
			let title = pet.show_records[type][s].name;

			let url = pet.show_records[type][s].url;

			let n;
			if (url) {
				let link = document.createElement("a");
				link.href = url;
				link.innerHTML = title;
				n = link;
			} else {
				let span = document.createElement("span");
				span.innerHTML = title;
				n = span;
			}

			entry.innerHTML = placement + " - ";
			entry.appendChild(n);
			document.getElementById("showRecord-entires").appendChild(entry);
		}
	}

	// document.getElementById("showPlacement-data").innerHTML = "";
    // if (showTypes[type]) {
    //     showTypes[type].forEach((p) => {
    //         addOption("showPlacement-data", p);
    //     });
    // }

}

function getPetByName(name, petz_data) {
	for (let species in petz_data) {
		for (let breed in petz_data[species]) {
			for (let entry in petz_data[species][breed]) {
				if (cleanName(petz_data[species][breed][entry].name) === cleanName(name)) {
					let pet = petz_data[species][breed][entry];
					pet.species = species;
					pet.breed = breed;
					return pet;
				}
			}
		}
	}
	return null;
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

function resetPetInfo() {
	document.getElementById("main-name").innerHTML = "Name";
	document.getElementById("guid").innerHTML = "guid";
	document.getElementById("pet-image").src = "";

	document.getElementById("name-input").value = "";
	document.getElementById("csv-name").innerHTML = "";

	document.getElementById("gender-select").value = "none";
	document.getElementById("csv-gender").innerHTML = "";

	document.getElementById("birthday-input").value = "";
	document.getElementById("csv-birthday").innerHTML = "";

	document.getElementById("gen_info").innerHTML = "";

	document.getElementById("breedFace-input").value = "";
	document.getElementById("breedFace").innerHTML = "";

	document.getElementById("pedigree-cbs").querySelectorAll('input[type=checkbox]').forEach((i) =>{
		i.checked = false;
	});


	document.getElementById("show-image").src = "";


}


function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}