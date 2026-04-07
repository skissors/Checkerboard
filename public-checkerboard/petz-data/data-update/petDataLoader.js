import { showTypes, personalityValues } from "./petHelperData.js";
import { getPointsFromPlacement, getTitleFromPoints } from "../petzFunc.js";
import { cleanName } from "../../checkerboard/scripts/utilities.js";

export function loadPetData(name, data) {
    resetPetInfo();
    let pet = getPetByName(name, data);
    let curPet = pet;
    console.log(pet);

    document.getElementById("pet-image").src = `..\\petz\\${pet.species}\\${pet.breed}\\${cleanName(pet.name)}\\${cleanName(pet.name)}.png`;
    document.getElementById("main-name").innerHTML = pet.displayName ? petdisplayName : pet.name;

    for (let p in pet) {
        if (document.getElementById(p)) document.getElementById(p).innerHTML = pet[p];
        if (document.getElementById(p + "-input")) {
            document.getElementById(p + "-input").value = pet[p];
            document.getElementById(p + "-input").onchange = (e) => {
                pet[p] = e.target.value;
            };
        }
        if (document.getElementById(p + "-select")) {
            document.getElementById(p + "-select").value = pet[p];
            document.getElementById(p + "-select").onchange = (e) => {
                pet[p] = e.target.value;
            };
        }
    }

    document
        .getElementById("pedigree-cbs")
        .querySelectorAll("input[type=checkbox]")
        .forEach((i) => {
            let id = i.id.split("-")[0];
            if (id === "nib") {
                i.checked = !pet.pedigree.inbred;
                i.onchange = (e) => {
                    pet.pedigree.inbred = e.target.checked;
                };
            } else {
                i.checked = pet.pedigree[id];
                i.onchange = (e) => {
                    pet.pedigree[id] = e.target.checked;
                };
            }
        });
    
    document
        .getElementById("fileNotes-cbs")
        .querySelectorAll("input[type=checkbox]")
        .forEach((i) => {
            let id = i.id.split("-")[0];
                i.checked = pet.fileNotes[id];
                i.onchange = (e) => {
                    pet.fileNotes[id] = e.target.checked;
                };
            }
        );

    for (let c in pet.csvData) {
        if (document.getElementById("csv-" + c)) document.getElementById("csv-" + c).innerHTML = pet.csvData[c];
    }

    for (let o in pet.origin) {
        if (document.getElementById("origin-" + o)) document.getElementById("origin-" + o).innerHTML = pet.origin[o];
    }

    loadPetShowData(pet);
    injectPetGraph(pet);
}

export function getPetByName(name, petz_data) {
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

export function resetPetInfo() {
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

	document
		.getElementById("pedigree-cbs")
		.querySelectorAll("input[type=checkbox]")
		.forEach((i) => {
			i.checked = false;
        });
    
    document
		.getElementById("fileNotes-cbs")
		.querySelectorAll("input[type=checkbox]")
		.forEach((i) => {
			i.checked = false;
		});

	document.getElementById("show-image").src = "";
}

function loadPetShowData(pet) {
    console.log("loading show data");
    console.log(pet);
    document.getElementById("show-image").src = `..\\petz\\${pet.species}\\${pet.breed}\\${cleanName(pet.name)}\\${cleanName(pet.name)}-pose.png`;

    let firstRecord = document.getElementById("showRecord-select").value;
    if (!pet.show_records || !pet.show_records[firstRecord]) firstRecord = null;
    document.getElementById("showRecord-select").innerHTML = "";
    console.log(firstRecord);
    for (let r in pet.show_records) {
        if (!firstRecord || firstRecord === "") firstRecord = r;
        addOption("showRecord-select", r);
    }
    document.getElementById("showRecord-select").onchange = (e) => {
        loadShowRecords(e.target.value, pet);
    };

    document.getElementById("showRecord-select").value = firstRecord;

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
    } else {
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

function injectPetGraph(pet) {
	if (Chart.getChart("personality-graph")) {
		Chart.getChart("personality-graph")?.destroy();
	}

	let ctx = document.getElementById("personality-graph");

	let personalityNums = [];
	personalityValues.forEach((value) => {
		personalityNums.push(parseInt(pet.personality[value]));
	});

	let data = {
		labels: personalityValues,
		datasets: [
			{
				label: "",
				data: personalityNums,
				fill: true,
				backgroundColor: "rgba(128, 128, 128, 0.75)",
				borderColor: "#808080ff",
				pointBackgroundColor: "#808080",
				pointBorderColor: "#fff",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "#808080",
			},
		],
	};

	Chart.defaults.color = "#000";
	Chart.defaults.font.family = "'Pixel Operator', 'Courier New', Courier, monospace";
	Chart.defaults.font.size = 16;
	Chart.defaults.font.weight = "normal";

	let options = {
		aspectRatio: 1.5,
		scales: {
			r: {
				max: 100,
				min: -10,
				ticks: {
					stepSize: 20,
					display: false,
				},
				pointLabels: {
					padding: 2,
					font: {
						size: 12,
					},
				},
			},
		},
		elements: {
			line: {
				borderWidth: 2,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
		},
	};

	new Chart(ctx, {
		type: "radar",
		data: data,
		options: options,
	});
}
