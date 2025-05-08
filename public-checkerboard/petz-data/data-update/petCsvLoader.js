import { petz_data as oldPetzData } from "../petz.js";
import { getPointsFromPlacement } from "../petzFunc.js";
import { checkImageExists, cleanName } from "../../checkerboard/scripts/utilities.js";
import { jsonStructure, personalityValues, showTypes, poseShows } from "./petHelperData.js";

let newPetData = {};

export function loadPetzCSVz() {
	let newPetData = {};
	for (let species in jsonStructure) {
		newPetData[species] = {};
		for (let i in jsonStructure[species]) {
			let breed = jsonStructure[species][i];
			newPetData[species][breed] = [];
			let target = newPetData[species][breed];
			let path = `..\\petz\\${species}\\${breed}\\petz.csv`;

			loadCSV(path, csvCallback, target, species, breed);
		}
	}
	return newPetData;
}

export function loadWithExistingPetInfo() {
	for (let species in oldPetzData) {
		newPetData[species] = {};
		for (let breed in oldPetzData[species]) {
			newPetData[species][breed] = [];

			for (let p in oldPetzData[species][breed]) {
				let pet = oldPetzData[species][breed][p];
				//if (!pet.personality) updatePetDataFormat(pet);
				newPetData[species][breed].push(pet);
			}

			let target = newPetData[species][breed];
			let path = `..\\petz\\${species}\\${breed}\\petz.csv`;
			loadCSV(path, csvCallback, target, species, breed);
		}
	}
	return newPetData;
}

function updatePetDataFormat(pet) {
	let newOrigin = {};
	newOrigin.name = pet.origin;
	newOrigin.site = pet.origin_site;
	newOrigin.url = pet.origin_url;

	pet.origin = newOrigin;

	let keysToKeep = ["name", "showname", "gender", "birthday", "gen_info", "origin", "comments", "show_records", "gallery"];

	Object.keys(pet).forEach((key) => {
		if (!keysToKeep.includes(key)) delete pet[key];
	});

	pet.csvData = {};
	pet.csvData.newlyAdded = false;

	pet.dataVersion = 2;
	return pet;
}

function loadCSV(url, callback, target, species, breed) {
	console.log("loading file: " + url);
	$.ajax({
		type: "GET",
		url: url,
		dataType: "text",
		success: function (data) {
			let dataList = $.csv.toObjects(data);
			callback(dataList, target, species, breed);
		},
	});
}

function csvCallback(dataList, target, species, breed) {
	dataList.forEach((csvPet) => {
		let oldPet = getPetByName(csvPet["Name"], newPetData);
		if (!oldPet) {
			target.push(buildNewPetInfoFromCSV(csvPet, species, breed));
		} else {
			mergeCSVPetInfo(oldPet, csvPet, species, breed);
		}
	});
	target.sort((a, b) => {
		const nameA = a.name.toUpperCase(); // Ignore case
		const nameB = b.name.toUpperCase(); // Ignore case
		if (nameA < nameB) {
			return -1;
		}
		if (nameA > nameB) {
			return 1;
		}
		return 0; // Names are equal
	});
}

function buildNewPetInfoFromCSV(csvPet, species, breed) {
	let newPet = {};

	newPet.csvData = {};
	newPet.csvData.newlyAdded = true;

	newPet.name = csvPet["Name"];
	newPet.csvData.name = csvPet["Name"];

	newPet.showname = "";

	newPet.origin = {};
	newPet.origin.ownerName = csvPet["Owner Name"];
	newPet.origin.name = "";
	newPet.origin.site = "";
	newPet.origin.url = "";

	newPet.guid = csvPet["GUID"];

	//basic info
	newPet.gender = csvPet["Gender"].toLowerCase();
	newPet.csvData.gender = csvPet["Gender"].toLowerCase();

	let birthday = new Date(csvPet["Adoption Date"]);
	let birthdayStr = birthday.toLocaleDateString("eng-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	newPet.birthday = birthdayStr;
	newPet.csvData.birthday = birthdayStr;

	//gen info
	newPet.breedFace = csvPet["Breed Face"];
	newPet.generations = csvPet["Generations"];
	newPet.pedigree = {};

	newPet.pedigree.purebred = false;
	if (csvPet["Blood Status"] === "Purebred") newPet.pedigree.purebred = true;

	newPet.pedigree.inbred = true;
	if (csvPet["Inbred %"] === "0.0") newPet.pedigree.inbred = false;

	newPet.pedigree.hexed = false;
	if (breed === "hexed") newPet.pedigree.hexed = true;

	buildGenInfo(newPet);

	//personality info
	newPet.flavors = csvPet["Favorite Flavor"].split(",");
	newPet.flavors.forEach((element) => {
		element.trim();
	});
	newPet.colors = csvPet["Favorite Color"].split(",");
	newPet.colors.forEach((element) => {
		element = element.trim();
	});

	newPet.scp = csvPet["Breed Personality"];

	let personality = {};
	personalityValues.forEach((value) => {
		personality[value] = csvPet[value + " Center"];
	});
	newPet.personality = personality;

	let showImg = `../petz/${species}/${breed}/${cleanName(newPet.name)}/${cleanName(newPet.name)}-pose.png`;
	if (
		checkImageExists(showImg, (exists) => {
			if (exists) {
				newPet.show_points = {};
				newPet.show_points["Pose Shows"] = 0;
			}
		})
	)
		newPet = mergeOldPetInfo(newPet);
	return newPet;
}

function mergeCSVPetInfo(newPet, csvPet, species, breed) {
	if (!newPet.csvData) newPet.csvData = {};
	newPet.csvData.newlyAdded = false;

	//update this later with guid
	newPet.csvData.name = csvPet["Name"];

	if (!newPet.showname) newPet.showname = "";

	// cvs only basic data
	newPet.origin.ownerName = csvPet["Owner Name"];
	newPet.guid = csvPet["GUID"];

	//compare gender
	newPet.gender = newPet.gender.toLowerCase();
	newPet.csvData.gender = csvPet["Gender"].toLowerCase();

	if (newPet.csvData.gender != newPet.gender) {
		console.log("gender mismatch " + newPet.name);
		//console.log("csv gender: " + newPet.csvData.gender);
		//console.log("saved gender: " + newPet.gender);
	}

	//compare birthday
	let birthday = new Date(csvPet["Adoption Date"]);
	let birthdayStr = birthday.toLocaleDateString("eng-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	newPet.csvData.birthday = birthdayStr;

	newPet.birthday = newPet.birthday.trim();
	if (newPet.csvData.birthday != newPet.birthday) {
		console.log("birthday mismatch " + newPet.name);
		//console.log("csv bday: " + newPet.csvData.birthday);
		//console.log("saved bday: " + newPet.birthday);
	}

	//build new pedigree info
	if (!newPet.breedFace) newPet.breedFace = csvPet["Breed Face"];
	newPet.generations = csvPet["Generations"];
	if (!newPet.pedigree) newPet.pedigree = {};

	newPet.pedigree.purebred = false;
	if (csvPet["Blood Status"] === "Purebred") newPet.pedigree.purebred = true;

	newPet.pedigree.inbred = true;
	if (csvPet["Inbred %"] === "0.0") newPet.pedigree.inbred = false;

	newPet.pedigree.hexed = false;
	if (breed === "hexed") newPet.pedigree.hexed = true;

	buildGenInfo(newPet);

	//personality info
	newPet.flavors = csvPet["Favorite Flavor"].split(",");
	newPet.flavors.forEach((element) => {
		element.trim();
	});
	newPet.colors = csvPet["Favorite Color"].split(",");
	newPet.colors.forEach((element) => {
		element = element.trim();
	});

	newPet.scp = csvPet["Breed Personality"];

	let personality = {};
	personalityValues.forEach((value) => {
		personality[value] = csvPet[value + " Center"];
	});
	newPet.personality = personality;

	// show data
	if (newPet.show_records) {
		newPet.show_points = {};
		newPet.show_points["Pose Shows"] = 0;

		for (let r in newPet.show_records) {
			if (!newPet.show_points[r]) newPet.show_points[r] = 0;
			for (let i in newPet.show_records[r]) {
				let record = newPet.show_records[r][i];
				newPet.show_points[r] += getPointsFromPlacement(record.placement, r);

				if (poseShows.includes(r)) {
					newPet.show_points["Pose Shows"] += getPointsFromPlacement(record.placement, r);
				}
			}
		}
	} else {
		let showImg = `../petz/${species}/${breed}/${cleanName(newPet.name)}/${cleanName(newPet.name)}-pose.png`;
		if (
			checkImageExists(showImg, (exists) => {
				if (exists) {
					newPet.show_points = {};
					newPet.show_points["Pose Shows"] = 0;
				}
			})
		);
	}
}

function mergeOldPetInfo(newPet) {
	let oldPet = getPetByName(newPet.name, oldPetzData);
	if (!oldPet) {
		newPet.csvData.newlyAdded = true;
		return newPet;
	}
	newPet.csvData.newlyAdded = false;

	let mergedPet = newPet;

	mergedPet.name = oldPet.name;

	//old pet only info
	if (oldPet.showname) mergedPet.showname = oldPet.showname;
	if (oldPet.show_records) {
		mergedPet.show_records = oldPet.show_records;

		mergedPet.show_points = {};
		mergedPet.show_points["Pose Shows"] = 0;

		for (let r in mergedPet.show_records) {
			if (!mergedPet.show_points[r]) mergedPet.show_points[r] = 0;
			for (let i in mergedPet.show_records[r]) {
				let record = mergedPet.show_records[r][i];
				mergedPet.show_points[r] += getPointsFromPlacement(record.placement, r);

				if (poseShows.includes(r)) {
					mergedPet.show_points["Pose Shows"] += getPointsFromPlacement(record.placement, r);
				}
			}
		}
	}

	if (oldPet.comments) mergedPet.comments = oldPet.comments;
	if (oldPet.gallery) mergedPet.gallery = oldPet.gallery;

	//origin info
	if (oldPet.personality) newPet.origin = oldPet.origin;
	else {
		mergedPet.origin.name = oldPet.origin;
		mergedPet.origin.site = oldPet.origin_site;
		mergedPet.origin.url = oldPet.origin_url;
	}

	//merged info
	mergedPet.gender = oldPet.gender;
	if (mergedPet.csvData.gender != oldPet.gender) {
		console.log("gender mismatch " + mergedPet.name);
		console.log("csv gender: " + mergedPet.csvData.gender);
		console.log("saved gender: " + mergedPet.gender);
	}

	mergedPet.birthday = oldPet.birthday.trim();
	if (mergedPet.csvData.birthday != oldPet.birthday.trim()) {
		console.log("birthday mismatch " + mergedPet.name);
		console.log("csv bday: " + mergedPet.csvData.birthday);
		console.log("saved bday: " + oldPet.birthday);
	}
	return mergedPet;
}

function getNumberWithOrdinal(n) {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function buildGenInfo(newPet) {
	let gen_info = getNumberWithOrdinal(newPet.generations) + " gen ";
	if (newPet.generations > 1) {
		if (newPet.pedigree.purebred) gen_info += "purebred ";
		if (!newPet.pedigree.inbred) gen_info += "NIB ";
	}
	gen_info += newPet.breedFace;

	if (newPet.pedigree.hexed) gen_info += " hexie";
	else if (newPet.pedigree.brexed) gen_info += " brexie";
	else if (newPet.pedigree.ow) gen_info += " OW mix";
	else if (newPet.pedigree.hexmix) gen_info += " hexmix";
	else gen_info += " mix";

	newPet.gen_info = gen_info;
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

function getOwnerData() {
	let ownerData = {};
	for (let species in petz_data) {
		for (let breed in petz_data[species]) {
			for (let entry in petz_data[species][breed]) {
				let pet = petz_data[species][breed][entry];

				let o = pet.origin;
				if (!ownerData[o]) {
					ownerData[o] = {};
					ownerData[o].site = [];
					ownerData[o].url = [];
				}

				if (pet.origin_site != "" && !ownerData[o].site.includes(pet.origin_site)) ownerData[o].site.push(pet.origin_site);
				if (pet.origin_url != "" && !ownerData[o].url.includes(pet.origin_url)) ownerData[o].url.push(pet.origin_url);
			}
		}
	}
	//download(JSON.stringify(ownerData), "ownerData.json", "application/json")
}

function download(content, fileName, contentType) {
	var a = document.createElement("a");
	var file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
}
