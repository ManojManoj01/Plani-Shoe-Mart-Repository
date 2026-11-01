package com.stepstyle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class StepStyleApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(StepStyleApplication.class, args);
    }

    private static void loadDotEnv() {
        File[] candidates = new File[] {
            new File(".env"),
            new File("Shoe_Shop/.env"),
            new File("../Shoe_Shop/.env"),
            new File("../.env"),
            new File("D:/Shoe Shop/Shoe_Shop/.env")
        };

        File envFile = null;
        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                envFile = candidate;
                break;
            }
        }

        if (envFile != null) {
            try {
                System.out.println("[StepStyle] Loading environment variables from: " + envFile.getAbsolutePath());
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                        continue;
                    }
                    int eqIndex = trimmed.indexOf('=');
                    if (eqIndex > 0) {
                        String key = trimmed.substring(0, eqIndex).trim();
                        String value = trimmed.substring(eqIndex + 1).trim();
                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            } catch (IOException ignored) {
                // Silently fallback if file cannot be read
            }
        }
    }
}

