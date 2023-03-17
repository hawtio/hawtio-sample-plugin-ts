"use strict";

// src/main/ts/simple/index.ts
var import_react2 = require("@hawtio/react");

// src/main/ts/simple/globals.ts
var import_react = require("@hawtio/react");
var pluginName = "simple-plugin";
var pluginTitle = "Simple Plugin";
var pluginPath = "/simple-plugin";
var log = import_react.Logger.get(pluginName);

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
  log.info("Loading", pluginName);
  import_react2.hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: SimplePlugin,
    isActive: () => Promise.resolve(true)
  });
  import_react2.helpRegistry.add(pluginName, pluginTitle, help_default, 100);
  import_react2.preferencesRegistry.add(pluginName, pluginTitle, SimplePreferences, 100);
};

// src/main/ts/index.ts
registerSimplePlugin();
