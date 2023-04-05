# Hawtio Sample Plugin

This sample demonstrates how to write and use a custom plugin [Hawtio v3](https://github.com/hawtio/hawtio) in a Spring Boot application.

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
