// This whole addon is one sanctioned hack. SDK v2 exposes no path to the
// internal runtime, so we capture it the way skymen's compat addons do:
// built-in plugins and behaviors are engine-internal classes registered on
// self.C3, and their instance constructors see `this._runtime`. We swap every
// registered Instance class for a capturing subclass; the first instance of
// anything built-in that gets constructed hands us the internal runtime.
let capturedRuntime = null;
const publishedNames = new Set();

function publish(name) {
  publishedNames.add(name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    get: () => capturedRuntime,
  });
}

const patched = new WeakSet();

function patchRegistry(registry) {
  if (!registry) return;
  for (const key in registry) {
    const entry = registry[key];
    if (!entry || !entry.Instance || patched.has(entry)) continue;
    const Orig = entry.Instance;
    entry.Instance = class extends Orig {
      constructor(...args) {
        super(...args);
        if (!capturedRuntime && this._runtime) {
          capturedRuntime = this._runtime;
        }
      }
    };
    patched.add(entry);
  }
}

function patchAll() {
  // The build validator imports this module in Node, where self is missing.
  const C3 = typeof self !== "undefined" && self.C3;
  if (!C3) return;
  patchRegistry(C3.Plugins);
  patchRegistry(C3.Behaviors);
}

patchAll();

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      this.name = "sdk_runtime";
      const properties = this._getInitProperties();
      if (properties) {
        this.name = properties[0];
      }
      // Addons that registered after this script loaded get patched now.
      patchAll();
      publish(this.name);
    }

    _release() {
      super._release();
    }

    _saveToJson() {
      return {
        name: this.name,
      };
    }

    _loadFromJson(o) {
      if (o.name !== this.name && !publishedNames.has(o.name)) {
        this.name = o.name;
        publish(this.name);
      }
    }

    _getDebuggerProperties() {
      return [
        {
          title: "Global Runtime",
          properties: [
            { name: "Name", value: this.name, readonly: true },
            {
              name: "Captured",
              value: capturedRuntime !== null,
              readonly: true,
            },
          ],
        },
      ];
    }
  };
}
