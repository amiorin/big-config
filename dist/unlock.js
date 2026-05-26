import { createWorkflow } from "./core.js";
import { checkRemoteTag, deleteRemoteTag, deleteTag, generateLockId } from "./lock.js";
import { registerFunction } from "./utils.js";
export const unlockAny = createWorkflow({
    firstStep: "big-config.unlock/generate-lock-id",
    wireFn: (step) => {
        switch (step) {
            case "big-config.unlock/generate-lock-id": return [generateLockId, "big-config.unlock/delete-tag"];
            case "big-config.unlock/delete-tag": return [deleteTag, "big-config.unlock/delete-remote-tag"];
            case "big-config.unlock/delete-remote-tag": return [deleteRemoteTag, "big-config.unlock/check-remote-tag"];
            case "big-config.unlock/check-remote-tag": return [checkRemoteTag, "big-config.unlock/end"];
            case "big-config.unlock/end": return [(x) => x];
            default: return [(x) => x];
        }
    },
    nextFn: (_step, nextStep, opts) => nextStep ? [nextStep, opts] : [undefined, opts]
});
registerFunction("big-config.unlock/unlock-any", unlockAny);
export { unlockAny as "unlock-any" };
//# sourceMappingURL=unlock.js.map