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

    readonly hash = '3a61061bc5fccbd14b31736a92d9c400bc5ecaed827570c810d462070da4c82f';

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

    // find the `dictionaries.js` file and check it if changed
    async doCheck() {
        const scd = this.gSC2DataManager.getSC2DataInfoAfterPatch();
        for (const scriptFileItem of scd.scriptFileItems.items) {
            if (scriptFileItem.name === 'dictionaries.js') {
                const h = await computeSHA256(scriptFileItem.content);
                console.log('[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is:', h);
                this.log.log(`[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is:${h}`);
                if (this.hash !== h) {
                    console.error('[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
                    console.error('[CheckDoLCompressorDictionaries]  ====== the hash expected is:', this.hash, 'but the real hash is:', h);
                    this.log.error('[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is not match, maybe DoLCompressorDictionaries changed.');
                    this.log.error(`[CheckDoLCompressorDictionaries]  ====== the hash expected is:${this.hash} but the real hash is:${h}`);
                } else {
                    console.log('[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is match, check ok.');
                    this.log.log('[CheckDoLCompressorDictionaries]  ====== the hash of [dictionaries.js] is match, check ok.');
                }
                return;
            }
        }
        console.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
        this.log.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
        return;
    }

}

