import { cleanName, setParam } from "./utilities.js";
import { petz_data } from "../../petz-data/petz.js";
import { getTitleFromPoints, getPointsFromPlacement, getRibbonImg, getOtherTitleImg } from "../../petz-data/petzFunc.js";

export function buildPetShowInfo(pet, hideAwards) {
    let cName = cleanName(pet.name)
    let recordData = getShowRecordBlocks(pet);
    let addTitleData = getOtherTitlesBlocks(pet);

    let block = 
    `<hr>
    <div class="pet-shows">
        ${hideAwards ?  "" : "<h2>Show Records</h2>"}
        <div class="show-header">
            <img src="../../petz-data/petz/${pet.species}/${pet.breed}/${cName}/${cName}-pose.png" class="show-pic">
            <div class="show-name">${getShowname(pet, recordData, addTitleData)}</div>
        </div>
        <div class="show-info">
            ${recordData["showBlocks"]}
        </div>
        <div class="other-titles">
            ${addTitleData["titleBlocks"]}
         </div>
        ${pet.awards && pet.awards.length > 0 && !hideAwards ? getAwardsBlock(pet) : ""}
    </div>`

    return block;
}

export function loadShowRecordPage() {
    setParam("page", "showroom")
    let body = ""
    for (let species in petz_data) {
        for (let breed in petz_data[species]) {
            for (let entry in petz_data[species][breed]) {
                let pet = petz_data[species][breed][entry]
                if (pet.show_records) {
                    body += buildPetShowInfo(pet, true);
                }
            }
        }
    }
    document.getElementById("inner-content").innerHTML = body;
}

export function getShowname(pet, recordData, addTitleData) {
    let showName = getTitleFromPoints(recordData.points.total) + " " + pet.showname;
    if (recordData.points["Agility"]) showName += " " + getTitleFromPoints(recordData.points["Agility"], "agility", pet.species);
    if (recordData.points["Trick Shows"]) showName += " " + getTitleFromPoints(recordData.points["Trick Shows"], "trick shows", pet.species)
    showName += " " + addTitleData["titleString"];
    return showName
}

export function getShowRecordBlocks(pet) {
    let showBlocks = ""
    let points = {}
	let tNumber = 0;
    let entryList = {}
    for (let type in pet.show_records) {
        if (type === "Form Shows" || type === "Petz Show Club") {
            if (!entryList["Pose Shows"]) entryList["Pose Shows"] = []
            entryList["Pose Shows"] = entryList["Pose Shows"].concat(pet.show_records[type]);
            type = "Pose Shows"
        }
        else {
            entryList[type] = pet.show_records[type]
        }

        entryList[type].sort((a,b) => {
            let aPoints = getPointsFromPlacement(a.placement, type);
            let bPoints = getPointsFromPlacement(b.placement, type);
            if (aPoints < bPoints) return 1;
            else if (aPoints > bPoints) return -1;
            else return 0; 
        });
    }


    for (let type in entryList) {
        let ribbons = "";
        let totalPoints = 0

		for (let entry in entryList[type]) {
			let record = entryList[type][entry];
			if (record.url) ribbons += `<a href="${record.url}" target="_blank">`;
			ribbons += `<img src="${getRibbonImg(record.placement, type, entryList[type].length, record.ribbon)}" title="${record.placement} - ${record.name}">`;
			if (record.url) ribbons += `</a>`;
			totalPoints += getPointsFromPlacement(record.placement, type);
		}
        
        if (type != "Other") {
            showBlocks += 
            `<div class="stats">
                <div>${type}</div>
                <div>Total Points: ${totalPoints}</div>
                <div>Average: ${(totalPoints/entryList[type].length).toFixed(2)}</div>
            </div>`
        }
        else {
            showBlocks += 
            `<div class="stats">
                <div>${type}</div>
            </div>`
        }
        showBlocks += `<div class="ribbons">${ribbons}</div>`
        if (type === "Form Shows" || type === "Petz Show Club" || type === "Pose Shows") {
            points["total"] = (points["total"] || 0) + totalPoints;
			tNumber += entryList[type].length;
		}
        else if (type != "Other") {
			points[type] = (points[type] || 0) + totalPoints;
		}
    }
    let returnObj = {};
	returnObj["showBlocks"] = showBlocks;
	returnObj["points"] = points;
	returnObj["totalAverage"] = (points.total / tNumber).toFixed(2);

	return returnObj;
}

function getAwardsBlock(pet) {
    let awards = ""
    for (let a in pet.awards) {
        awards += `<img src="../../petz-data/petz/${pet.species}/${pet.breed}/${cleanName(pet.name)}/award/${pet.awards[a]}">`
    }

    let block =
    `<h2>Awards</h2>
    <div class="show-awards">
        ${awards}
    </div>`

    return block
}

export function getOtherTitlesBlocks(pet) {
	let titleString = "";
	let titleBlocks = "";
	let lastTitles = [];
	for (let type in pet.other_titles) {
		let entryList = pet.other_titles[type];
		let ribbons = "";
		let lastTitle = "";
		for (let e in entryList) {
			ribbons += `<img src="${getOtherTitleImg(entryList[e]["title"], type)}" title="${entryList[e]["name"]}" />`;
			lastTitle = entryList[e]["title"];
		}
		if (!lastTitles.includes(lastTitle)) lastTitles.push(lastTitle);
		titleBlocks += `
					<div>
						<div>${type}</div>
						<div class="ribbons">
							${ribbons}
						</div>
					</div>`;
	}
	for (let t in lastTitles) {
		titleString += lastTitles[t] + " ";
	}
	let returnObj = {};
	returnObj["titleString"] = titleString;
	returnObj["titleBlocks"] = titleBlocks;
	return returnObj;
}