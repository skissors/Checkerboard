import { petz_data } from "./petz.js";
import { cleanName } from "../checkerboard/scripts/utilities.js";

export function getPetByName(name) {
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

/* SHOW FUNCTIONS */
export function getOtherTitleImg(placement, type) {
    let s = "/petz-data/petz/ribbons/titles/";
    if (type === "Neb's PCS") {
        return s + placement + "_neb.png";
    } else {
        return s + placement + ".png";
    }
}

export function getRibbonImg(placement, showType, total, altRibbon) {
    let result = "/petz-data/petz/ribbons/unknown.gif";
    let subfolder = "";
    if (altRibbon) subfolder = altRibbon + "/"

    let suffix = ".gif";
    if (total <= 10) {
        suffix = "_ribbon.png";
    }
    if (showType === "Agility" || showType === "Trick Shows") {
        switch (placement) {
            case "1st":
            case "2nd":
            case "3rd":
            case "4th":
            case "HM":
                result = "/petz-data/petz/ribbons/trick/" + subfolder + placement + suffix;
        }
    } 
    else if (showType === "Petz Kennel Club") {
        switch(placement) {
            case "BCP":
            case "RCP":
            case "HMCP":
                result = "/petz-data/petz/ribbons/pkc/" + subfolder + placement + suffix;
        }
    }
    else {
        
        switch (placement) {
            case "BIS":
            case "1st":
            case "2nd":
            case "3rd":
            case "HM":
            case "BCP":
            case "RCP":
            case "HMCP":
                result = "/petz-data/petz/ribbons/" + subfolder + placement + suffix;
        }
    }
    return result;
}

export function getTrophyImg(title, showType) {
    if (showType === "Standard Pose") {
        switch (title) {
            case "Ch":
            case "GCh":
            case "MGCh":
            case "SGCh":
                return "/petz-data/petz/ribbons/" + title + ".png";
        }
    }
    return null;
}

export function getPointsFromPlacement(placement, type) {
    if (type.toLowerCase() === "agility" || type.toLowerCase() === "trick shows") {
        switch (placement) {
            case "1st":
                return 5;
            case "2nd":
                return 4;
            case "3rd":
                return 3;
            case "4th":
                return 2;
            case "HM":
                return 1;
            default:
                return 0;
        }
    } else {
        switch (placement) {
            case "BIS":
                return 5;
            case "1st":
            case "BCP":
                return 4;
            case "2nd":
            case "RCP":
                return 3;
            case "3rd":
            case "HMCP":
                return 2;
            case "HM":
                return 1;
            default:
                return 0;
        }
    }
}

export function getTitleFromPoints(points, type, species) {
    if (!type) type = "";
    if (!species) species = "";
    if (type.toLowerCase() === "agility") {
        if (species.toLowerCase() === "dogz") {
            if (points >= 30) return "ADCh";
            else if (points >= 15) return "ADX";
            else if (points >= 10) return "AD";
            else return "";
        } else if (species.toLowerCase() === "catz") {
            if (points >= 30) return "ACCh";
            else if (points >= 15) return "ACX";
            else if (points >= 10) return "AC";
            else return "";
        } else {
            if (points >= 30) return "APCh";
            else if (points >= 15) return "APX";
            else if (points >= 10) return "AP";
            else return "";
        }
    } else if (type.toLowerCase() === "trick shows") {
        if (species.toLowerCase() === "dogz") {
            if (points >= 30) return "TDX";
            else if (points >= 20) return "TDA";
            else if (points >= 10) return "TD";
            else return "";
        } else if (species.toLowerCase() === "catz") {
            if (points >= 30) return "TCX";
            else if (points >= 20) return "TCA";
            else if (points >= 10) return "TC";
            else return "";
        } else {
            if (points >= 30) return "TPX";
            else if (points >= 20) return "TPA";
            else if (points >= 10) return "TP";
            else return "";
        }
    } else {
        if (points >= 500) return "Legend";
        else if (points >= 300) return "LCh";
        else if (points >= 200) return "RLCh";
        else if (points >= 100) return "WCh";
        else if (points >= 90) return "RWCh";
        else if (points >= 50) return "UGCh";
        else if (points >= 30) return "SGCh";
        else if (points >= 20) return "MGCh";
        else if (points >= 15) return "GCh";
        else if (points >= 10) return "Ch";
        else if (points >= 5) return "RCh";
        else return "";
    }
}

export function getTotalPointsForShowType(typeArr, pet, type) {
    if(typeArr === null) {
        typeArr = pet.show_records[type];
        
    }
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
        }
}
