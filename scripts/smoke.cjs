// USAGE: load the built bundle against a stubbed obsidian API and assert it still registers its commands

const Module = require('module');
const path = require('path');

const calls = [];

function instance(seed = {}) {
  const target = function stub() {};
  return new Proxy(target, {
    get(t, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'toJSON') return () => ({});
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop in seed) return seed[prop];
      return (...args) => {
        calls.push({ prop: String(prop), args });
        if (prop === 'loadData') return Promise.resolve(seed.loadData ?? null);
        if (prop === 'saveData') return Promise.resolve();
        if (prop === 'onLayoutReady') {
          const cb = args.find((a) => typeof a === 'function');
          if (cb) cb();
          return instance();
        }
        return instance();
      };
    },
    set(t, prop, value) {
      seed[prop] = value;
      return true;
    },
    construct() {
      return instance();
    },
    apply() {
      return instance();
    },
  });
}

function stubClass(name) {
  const proto = new Proxy(
    {},
    {
      get(t, prop) {
        if (prop === 'constructor') return cls;
        if (prop === 'then') return undefined;
        if (prop === Symbol.toPrimitive) return () => '';
        return (...args) => {
          calls.push({ prop: String(prop), args });
          if (prop === 'loadData') return Promise.resolve(null);
          if (prop === 'saveData') return Promise.resolve();
          if (prop === 'onLayoutReady') {
            const cb = args.find((a) => typeof a === 'function');
            if (cb) cb();
            return instance();
          }
          return instance();
        };
      },
    }
  );
  const cls = function () {};
  cls.prototype = Object.create(proto);
  cls.name = name;
  return cls;
}

const obsidianStub = new Proxy(
  {},
  {
    get(t, prop) {
      if (prop === 'Platform') return { isDesktopApp: true, isMobileApp: false };
      if (prop === 'normalizePath') return (p) => p;
      if (prop === 'moment') return () => ({ format: () => '' });
      if (prop === '__esModule') return false;
      return stubClass(String(prop));
    },
  }
);

const origLoad = Module._load;
Module._load = function (request) {
  if (request === 'obsidian') return obsidianStub;
  return origLoad.apply(this, arguments);
};

const bundlePath = path.resolve(__dirname, '..', 'main.js');

(async () => {
  const mod = require(bundlePath);
  const PluginClass = mod.default ?? mod;
  const app = instance({ workspace: instance(), vault: instance() });
  const plugin = new PluginClass(app, { id: 'neighbouring-files', version: '0.0.0' });

  await plugin.onload();

  const commands = calls.filter((c) => c.prop === 'addCommand').map((c) => c.args[0]);
  const tabs = calls.filter((c) => c.prop === 'addSettingTab').length;
  for (const command of commands) console.log('  command:', command && command.id);
  console.log(`commands=${commands.length} settingTabs=${tabs}`);

  if (typeof plugin.onunload === 'function') plugin.onunload();

  if (!commands.length) {
    console.error('smoke: the bundle loaded but registered no command');
    process.exit(1);
  }
  console.log('smoke: ok');
})().catch((err) => {
  console.error('smoke: ' + (err && err.message));
  process.exit(1);
});
