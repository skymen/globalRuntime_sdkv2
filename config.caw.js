import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";
export const addonType = ADDON_TYPE.PLUGIN;
export const type = PLUGIN_TYPE.OBJECT;
export const id = "skymen_GlobalRuntime";
export const name = "Global Runtime";
export const version = _version;
export const minConstructVersion = undefined;
export const author = "skymen";
export const website = "https://github.com/skymen/globalRuntime_sdkv2";
export const documentation = "https://github.com/skymen/globalRuntime_sdkv2";
export const description = "Makes the SDK runtime global";
export const category = ADDON_CATEGORY.GENERAL;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false,
    watch: false,
    targets: ["x86", "x64"],
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};

export const aceCategories = {};

export const info = {
  Set: {
    CanBeBundled: true,
    IsDeprecated: false,
    IsSingleGlobal: true,
  },
  AddCommonACEs: {
    Position: false,
    SceneGraph: false,
    Size: false,
    Angle: false,
    Appearance: false,
    ZOrder: false,
  },
};

export const properties = [
  {
    type: PROPERTY_TYPE.TEXT,
    id: "global-runtime-name",
    options: {
      initialValue: "sdk_runtime",
    },
    name: "Global Runtime Name",
    desc: "The name to use to expose the runtime with",
  },
];
