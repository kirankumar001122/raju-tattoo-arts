package com.rajutattoo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class RajuTattooApplication {

    public static void main(String[] args) {
        loadDotEnvFiles();
        SpringApplication.run(RajuTattooApplication.class, args);
    }

    private static void loadDotEnvFiles() {
        String[] possiblePaths = {
                ".env",
                "../.env",
                "backend/.env",
                "c:/Users/91897/Desktop/Tatto Store/raju-tattoo-arts/.env",
                "c:/Users/91897/Desktop/Tatto Store/.env"
        };

        for (String path : possiblePaths) {
            try {
                File file = new File(path);
                if (file.exists() && file.isFile()) {
                    List<String> lines = Files.readAllLines(file.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // strip quotes if present
                            if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (!key.isEmpty() && (System.getProperty(key) == null || System.getProperty(key).isEmpty())) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("[DOTENV LOADER] Successfully loaded environment variables from: " + file.getAbsolutePath());
                }
            } catch (Exception e) {
                System.err.println("[DOTENV LOADER] Notice: Failed reading " + path + ": " + e.getMessage());
            }
        }
    }
}
