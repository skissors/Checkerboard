import { getPetByName } from "../../petz-data/petzFunc.js";
import { setParam, cleanName } from "./utilities.js";
import { buildPetShowInfo } from "./template-show-info.js";

let personalityValues = [
	"Liveliness",
	"Playfulness",
	"Independence",
	"Confidence",
	"Naughtiness",
	"Acrobaticness",
	"Patience",
	"Kindness",
	"Nurturing",
	"Finickiness",
	"Intelligence",
	"Messiness",
	"Quirkiness",
	"Insanity",
	"Constitution",
	"Metabolism",
	"Dogginess",
];

export function buildPetPage(name) {
	let pet = getPetByName(name);
	if (pet === null) return;

	setParam("page", pet.name);

	let body = "";

	body += buildPetBasicInfo(pet);

	if (pet.personality) body += buildStatsInfo(pet);

	if (pet.comments) body += buildPetCommentInfo(pet);

	if (pet.show_records) body += buildPetShowInfo(pet);

	if (pet.gallery && pet.gallery.length > 0) body += buildGalleryInfo(pet);

	document.getElementById("inner-content").innerHTML = body;

	if (pet.personality) injectPetGraph(pet, cleanName(pet.name) + "-graph");
}

/* Basic Info Functions */
function buildPetBasicInfo(pet) {
	let cName = cleanName(pet.name);
	let block = `<div class="pet-info">
		<div style="position:relative">
			<img src="../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${cName}/${cName}.png">
		</div>
        <div class="pet-name">
            <img src="../../petz-data/petz/${pet.species}${pet.gender}.png">
            <div>${pet.name}</div>
        </div>
        ${pet.gen_info && pet.gen_info != "" ? "<div>" + pet.gen_info + "</div>" : ""}
        <div>Born ${pet.birthday}</div>
        <div>${getOwnerNameString(pet)}</div>
    </div>`;
	return block;
}

function getOwnerNameString(pet) {
	let nameStr = "";
	if (pet.origin && !pet.origin.name) {
		if (pet.origin.ownerName) {
			nameStr = "Adopted from " + pet.origin.ownerName;
		}
		else if (pet.origin === "me") {
			if (pet.breed === "hexed") nameStr = "Hexed by me";
			else nameStr = "Bred by me";
		} else {
			nameStr += "Adopted from " + pet.origin;
			if (pet.origin_site) {
				if (pet.origin_url) nameStr += `@<a href="${pet.origin_url}" target="_blank">${pet.origin_site}</a>`;
				else nameStr += "@" + pet.origin_site;
			}
		}
	}
    else if (pet.origin.name){
        if (pet.origin.name === "me") {
			if (pet.breed === "hexed") nameStr = "Hexed by me";
			else nameStr = "Bred by me";
		} else {
			nameStr += "Adopted from " + pet.origin.name;
			if (pet.origin.site) {
				if (pet.origin.url) nameStr += `@<a href="${pet.origin.url}" target="_blank">${pet.origin.site}</a>`;
				else nameStr += "@" + pet.origin.site;
			}
		}
    }
	return nameStr;
}

/* Comment Info Functions */
function buildPetCommentInfo(pet) {
	let block = `<hr>
    <div class="pet-comments">
        <h2>Comments</h2>
        <p>${pet.comments}</p>
    </div> `;
	return block;
}

/* Gallery Functions */
function buildGalleryInfo(pet) {
	let pix = "";
	for (let a in pet.gallery) {
		pix += `<img src="../../petz-data/petz/${pet.species}/${cleanName(pet.breed)}/${cleanName(pet.name)}/gallery/${pet.gallery[a]}">`;
	}

	let block = `<hr>
    <h2>Gallery</h2>
    <div class="gallery">
        ${pix}
    </div>`;

	return block;
}

function buildStatsInfo(pet) {
	let flavors = "";
	pet.flavors.forEach((f) => {
		let flavor = cleanName(f.trim());
		flavors += `<img src="../petz-data/fav-icons/flavors/${flavor}.png">`;
	});

	let colors = "";
	pet.colors.forEach((c) => {
		let color = cleanName(c.trim());
		colors += `<img src="../petz-data/fav-icons/colors/${color}.png">`;
	});

	let statsInfo =
		//html
		`<hr>
    <h2>Personality Info</h2>
    <div class="stats">
        <div class="personality-box" style="width: 325px">
            <canvas id="${cleanName(pet.name)}-graph"></canvas>
            <div class="fav">SCP Personality: ${pet.scp}</div>
            <div class="fav">Favorites: ${flavors} / ${colors}</div>
        </div>
    </div>
    `;

	return statsInfo;
}

function injectPetGraph(pet, id) {
	let ctx = document.getElementById(cleanName(pet.name) + "-graph");

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
				backgroundColor: "rgb(153, 129, 194, 0.75)",
				borderColor: "#7654C4",
				pointBackgroundColor: "#7654C4",
				pointBorderColor: "#fff",
				pointHoverBackgroundColor: "#fff",
				pointHoverBorderColor: "#7654C4",
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
