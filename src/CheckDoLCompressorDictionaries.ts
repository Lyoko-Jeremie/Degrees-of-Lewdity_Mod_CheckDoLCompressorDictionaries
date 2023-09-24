import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";

export async function computeSHA256(str: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export class CheckDoLCompressorDictionaries implements LifeTimeCircleHook {

    private log: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.log = this.gModUtils.getLogger();
        this.gModUtils.getModLoadController().addLifeTimeCircleHook(this);
    }

    async ModLoaderLoadEnd() {
        await this.doCheck();
    }

    h1 = 'fa569ce4c2ca945d77da656c9d7a2e3d673157ce6d4602750c42d6effab987ed';
    h2 = '5ae6423bbe9ab05fd8b4e83127e1aaa4b56a9d5512f36f56292bfa52f1aa1db8';

    private async pickDoLCompressorDictionariesFromCode(code: string) {
        const DoLCompressorDictionaries: {
            [key: string]: Set<string | number>
        } = (new Function(`${code};return DoLCompressorDictionaries;`))();
        const keys = Object.keys(DoLCompressorDictionaries);
        if (keys.length !== 1) {
            return false;
        }
        if (keys[0] !== 'v0') {
            return false;
        }
        const v0 = Array.from(DoLCompressorDictionaries['v0']).sort();
        const h1 = await computeSHA256(JSON.stringify(v0));
        const h2 = await computeSHA256(JSON.stringify(DoLCompressorDictionaries['v0']));
        if (h1 !== this.h1) {
            console.error('[CheckDoLCompressorDictionaries]  ====== the hash 1 of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
            console.error('[CheckDoLCompressorDictionaries]  ====== the hash 1 expected is:', this.h1, 'but the real hash is:', h1);
            this.log.error('[CheckDoLCompressorDictionaries]  ====== the hash 1 of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
            this.log.error(`[CheckDoLCompressorDictionaries]  ====== the hash 1 expected is:${this.h1} but the real hash is:${h1}`);
            return false;
        }
        if (h2 !== this.h2) {
            console.error('[CheckDoLCompressorDictionaries]  ====== the hash 2 of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
            console.error('[CheckDoLCompressorDictionaries]  ====== the hash 2 expected is:', this.h2, 'but the real hash is:', h2);
            this.log.error('[CheckDoLCompressorDictionaries]  ====== the hash 2 of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
            this.log.error(`[CheckDoLCompressorDictionaries]  ====== the hash 2 expected is:${this.h2} but the real hash is:${h2}`);
            return false;
        }
        return true;
    }

    // find the `dictionaries.js` file and check it if changed
    async doCheck() {
        const scd = this.gSC2DataManager.getSC2DataInfoAfterPatch();
        for (const scriptFileItem of scd.scriptFileItems.items) {
            if (scriptFileItem.name === 'dictionaries.js') {
                if (await this.pickDoLCompressorDictionariesFromCode(scriptFileItem.content)) {
                    console.log('[CheckDoLCompressorDictionaries]  ====== check passed.');
                    this.log.log('[CheckDoLCompressorDictionaries]  ====== check passed.');
                    return;
                } else {
                    console.error('[CheckDoLCompressorDictionaries]  ====== check failed.');
                    this.log.error('[CheckDoLCompressorDictionaries]  ====== check failed.');
                    return;
                }
            }
        }
        console.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
        this.log.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
        return;
    }

}

