// This file reports your score, highscore and a "fingerprint"
// of your browser. All data is completely anonymous, and I'll
// publish interesting results from the data later.

let fingerprint;
_getFingerprint().then(s => fingerprint = s).catch(e => (e));

function _getFingerprint() {
    return new Promise((resolve, reject) => {
        async function getHash() {
            const options = {
                excludes: {
                    plugins: true,
                    localStorage: true,
                    adBlock: true,
                    screenResolution: true,
                    availableScreenResolution: true,
                    enumerateDevices: true,
                    pixelRatio: true,
                    doNotTrack: true
                },
                preprocessor: (key, value) => {
                    if (key === 'userAgent') {
                        const parser = new UAParser(value)
                        return `${parser.getOS().name} :: ${parser.getBrowser().name} :: ${parser.getEngine().name}`
                    }
                    return value
                }
            }

            try {
                const components = await Fingerprint2.getPromise(options)
                const values = components.map(component => component.value)
                return String(Fingerprint2.x64hash128(values.join(''), 31))
            } catch (e) {
                reject(e)
            }
        }

        if (window.requestIdleCallback) {
            requestIdleCallback(async () => resolve(await getHash()))
        } else {
            setTimeout(async () => resolve(await getHash()), 500)
        }
    })
}
export default function LOGSCORE(score, highscore) {
    fetch(`https://flappymillennial2.azure-api.net/flappymillennial/score/${score}/${highscore}/${fingerprint ?? "none"}/${Date.now()}`)
        .then((response) => {
            if (!response.ok)
                throw Error(response.statusText)
            return response.json();
        }).catch(() => { });
}