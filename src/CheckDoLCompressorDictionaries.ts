import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";

export class CheckDoLCompressorDictionaries implements LifeTimeCircleHook {

    private log: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.log = this.gModUtils.getLogger();
        this.gModUtils.getModLoadController().addLifeTimeCircleHook('CheckDoLCompressorDictionaries', this);
    }

    async ModLoaderLoadEnd() {
        await this.doCheck();
    }

    // find the `dictionaries.js` file and check it if changed
    async doCheck() {
        const scdOrigin = this.gSC2DataManager.getSC2DataInfoCache();
        const scd = this.gSC2DataManager.getSC2DataInfoAfterPatch();
        const od = scdOrigin.scriptFileItems.map.get('dictionaries.js');
        const nd = scd.scriptFileItems.map.get('dictionaries.js');
        if (!od || !nd) {
            console.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
            this.log.error('[CheckDoLCompressorDictionaries]  ====== not found [dictionaries.js], maybe DoLCompressorDictionaries not loaded.');
            return;
        }
        if (od.content === nd.content) {
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

