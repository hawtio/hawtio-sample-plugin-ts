"use strict";

// src/main/ts/custom-tree/index.ts
var import_react2 = require("@hawtio/react");

// src/main/ts/custom-tree/CustomTree.tsx
var CustomTree = () => null;

// src/main/ts/custom-tree/globals.ts
var import_react = require("@hawtio/react");
var pluginName = "custom-tree";
var pluginTitle = "Custom Tree";
var pluginPath = "/custom-tree";
var log = import_react.Logger.get(pluginName);

// src/main/ts/custom-tree/index.ts
var registerCustomTreePlugin = () => {
  log.info("Loading", pluginName);
  import_react2.hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: CustomTree,
    isActive: () => Promise.resolve(true)
  });
};

// src/main/ts/simple/index.ts
var import_react4 = require("@hawtio/react");

// src/main/ts/simple/globals.ts
var import_react3 = require("@hawtio/react");
var pluginName2 = "simple-plugin";
var pluginTitle2 = "Simple Plugin";
var pluginPath2 = "/simple-plugin";
var log2 = import_react3.Logger.get(pluginName2);

// src/main/ts/simple/help.md
var help_default = "# Spring Boot Sample plugin\n\nHelp documentation for Spring Boot Sample plugin.\n";

// src/main/ts/simple/SimplePlugin.tsx
var import_react_core = require("@patternfly/react-core");
var import_jsx_runtime = require("react/jsx-runtime");
var SimplePlugin = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_core.PageSection, { variant: import_react_core.PageSectionVariants.light, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react_core.TextContent, { children: [
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_core.Text, { component: "h1", children: "Simple Plugin" }),
  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_core.Text, { component: "p", children: "Hello world!" })
] }) });

// src/main/ts/simple/SimplePreferences.tsx
var import_react_core2 = require("@patternfly/react-core");
var import_jsx_runtime2 = require("react/jsx-runtime");
var SimplePreferences = () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_core2.CardBody, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_core2.Form, { isHorizontal: true, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_core2.FormSection, { title: "UI", titleElement: "h2", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
  import_react_core2.FormGroup,
  {
    label: "Reset settings",
    fieldId: "reset-form-reset",
    helperText: "Clear all custom settings stored in your browser's local storage and reset to defaults.",
    children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react_core2.Button, { variant: "primary", children: "Button" })
  }
) }) }) });

// src/main/ts/simple/index.ts
var registerSimplePlugin = () => {
  log2.info("Loading", pluginName2);
  import_react4.hawtio.addPlugin({
    id: pluginName2,
    title: pluginTitle2,
    path: pluginPath2,
    component: SimplePlugin,
    isActive: () => Promise.resolve(true)
  });
  import_react4.helpRegistry.add(pluginName2, pluginTitle2, help_default, 100);
  import_react4.preferencesRegistry.add(pluginName2, pluginTitle2, SimplePreferences, 100);
};

// src/main/ts/index.ts
registerSimplePlugin();
registerCustomTreePlugin();
