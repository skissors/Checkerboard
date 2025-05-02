export function cleanName(name) {
	return name.replace(/[^0-9a-z]/gi, "").toLowerCase();
}

export function getCookieValue(name) {
	function escape(s) {
		return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
	}
	var match = document.cookie.match(RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"));
	return match ? match[1] : null;
}

export function getJsonCookie(name) {
	let cookie = getCookieValue(name);
	if (cookie) {
		try { return JSON.parse(cookie); } 
		catch { return null; } 
	}
	return null
}

export function setCookieValue(name, value, time=31536000, sameSite="Lax") {
    document.cookie = `${name}=${value}; Max-Age=${time}; SameSite=${sameSite}; path=/`;
}

export function setJsonCookie(name, value, time=31536000, sameSite="Lax") {
	setCookieValue(name, JSON.stringify(value), time, sameSite)
}

export function setParam(name, value) {
	const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState(null, '', url.toString());
}

export function getParam(name) {
	let params = (new URL(document.location)).searchParams;
	return params.get(name);
}

export function inIFrame () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function checkImageExists(src, callback) {
	let img = new Image();
	try {
		img.src = src;
		if (img.complete) {
			callback(true);
		} else {
			img.onload = () => {
				callback(true);
			};
			img.onerror = () => {
				callback(false);
			};
		}
	}
	catch {
		callback(false)
	}
}