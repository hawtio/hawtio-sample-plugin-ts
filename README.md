# Hawtio Sample Plugin

[![Build](https://github.com/hawtio/hawtio-sample-plugin-ts/actions/workflows/build.yml/badge.svg)](https://github.com/hawtio/hawtio-sample-plugin-ts/actions/workflows/build.yml)

This sample demonstrates how to write and use a custom plugin with [Hawtio v3](https://github.com/hawtio/hawtio) in a Spring Boot application.

## Key components

The key components of this sample are as follows:

| File/Directory | Description |
| -------------- | ----------- |
| [sample-plugin/](./sample-plugin) | The Hawtio v3 plugin project written in TypeScript. Since a Hawtio plugin is based on React and [Webpack Module Federation](https://module-federation.github.io/), this project uses Yarn v3 and [CRACO](https://craco.js.org/) as the build tools. You can use any JS/TS tools for developing a Hawtio plugin so long as they can build a React and Webpack Module Federation application. |
| [craco.config.js](./sample-plugin/craco.config.js) | The React application configuration file. The plugin interface is defined with `ModuleFederationPlugin`. The name `samplePlugin` and the module name `./plugin` at the `exposes` section correspond to the parameters `scope` and `module` set to `HawtioPlugin` in `PluginContextListener.java`. |
| [SampleSpringBootService.java](./src/main/java/io/hawt/example/spring/boot/SampleSpringBootService.java) | This is where the application registers the plugin to Hawtio. To register a plugin in Spring Boot, it should create the Spring Boot version of [HawtioPlugin](https://github.com/hawtio/hawtio/blob/hawtio-3.0-M3/platforms/springboot/src/main/java/io/hawt/springboot/HawtioPlugin.java) and provide it to Spring context. The three key parameters to pass to `HawtioPlugin` are `url`, `scope`, and `module`, which are required by Module Federation. |
| [pom.xml](./pom.xml) | This project uses Maven as the primary tool for building. Here, the `frontend-maven-plugin` is used to trigger the build of `sample-plugin` TypeScript project, then the built output is included as resources for packaging the WAR archive. |

## How to run

### Build

The following command first builds the `sample-plugin` frontend project and then compiles and packages the main Java project together.

```console
mvn clean install
```

Building the frontend project can take time, so if you build it once and make no changes on the project afterwards, you can speed up the whole build by skipping the frontend part next time.

```console
mvn install -Dskip.yarn
```

### Run

Run with:

```console
mvn spring-boot:run -Dskip.yarn
```

You can access the Hawtio console with the sample plugin at: <http://localhost:8080/hawtio/>

## Faster plugin development

You could run `mvn install` or `mvn spring-boot:run` every time to incrementally develop the `sample-plugin` frontend project while checking its behaviour in the browser. But this is not suitable for running the fast development feedback cycle.

As shown below, a faster development cycle can be achieved by directly running the `sample-plugin` frontend project itself in development mode with `yarn start`, while starting the main Spring Boot application on the backend.

### Development

To develop the plugin, firstly launch the main Spring Boot application on the backend:

```console
mvn spring-boot:run -Dskip.yarn
```

Then start the plugin project in development mode:

```console
cd sample-plugin
yarn start
```

Now you should be able to preview the plugins under development at <http://localhost:3001/hawtio/>. However, since it still hasn't been connected to a backend JVM, you can only test plugins that don't require the JMX MBean tree.

To test plugins that depend on the JMX MBean tree, use Connect plugin <http://localhost:3001/hawtio/connect> to connect to the main Spring Boot application running in the background. The Jolokia endpoint should be <http://localhost:8080/hawtio/jolokia>.

Now you can preview all kinds of plugins on the console under development, and run a faster development cycle by utilising hot reloading provided by Create React App.
