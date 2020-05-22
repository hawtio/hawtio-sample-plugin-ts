package io.hawt.example.spring.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import io.hawt.springboot.HawtioPlugin;

@SpringBootApplication
public class SampleSpringBootService {

    public static void main(String[] args) {
        SpringApplication.run(SampleSpringBootService.class, args);
    }

    @Bean
    public HawtioPlugin samplePlugin() {
        return new HawtioPlugin("sample-plugin",
                "plugins",
                "",
                new String[] { "sample-plugin.js" });
    }
}
