// This whole addon is one sanctioned hack. SDK v2 exposes no path to the
// internal runtime, so we capture it the way skymen's other hacks do: patch
// the built-in Sprite plugin's engine-internal Instance class so its
// constructor records `this._runtime` from the first Sprite created.
//
// The global name and the runtime arrive from two different places in
// unknown order, so both sides hand their piece to expose() and whichever
// arrives second triggers the plain assignment.
let capturedRuntime = null;
let publishName = null;
let spritePatched = false;

function expose() {
  if (publishName !== null && capturedRuntime !== null) {
    globalThis[publishName] = capturedRuntime;
  }
}

function patchSprite() {
  if (spritePatched) return;
  // The build validator imports this module in Node, where self is missing.
  const C3 = typeof self !== "undefined" && self.C3;
  if (!C3) return;
  if (!C3.Plugins.Sprite || !C3.Plugins.Sprite.Instance) {
    console.warn(
      "[Global Runtime] Sprite plugin not found. Add a Sprite to the project or the runtime cannot be captured."
    );
    return;
  }
  const Orig = C3.Plugins.Sprite.Instance;
  C3.Plugins.Sprite.Instance = class extends Orig {
    constructor(...args) {
      super(...args);
      if (!capturedRuntime && this._runtime) {
        capturedRuntime = this._runtime;
        expose();
      }
    }
  };
  spritePatched = true;
}

patchSprite();

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      this.name = "sdk_runtime";
      const properties = this._getInitProperties();
      if (properties) {
        this.name = properties[0];
      }
      patchSprite();
      publishName = this.name;
      expose();
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
