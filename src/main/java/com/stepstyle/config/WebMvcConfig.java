package com.stepstyle.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final String uploadDir;

    public WebMvcConfig(@Value("${app.upload.dir:uploads/products}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path basePath = uploadPath.getParent() != null ? uploadPath.getParent() : uploadPath;

        Set<String> locations = new LinkedHashSet<>();
        // Base uploads directory: ensures /uploads/products/xyz.jpg resolves to uploads/products/xyz.jpg
        locations.add(ensureTrailingSlash(basePath.toUri().toString()));
        // Direct product directory: ensures /uploads/xyz.jpg resolves to uploads/products/xyz.jpg
        locations.add(ensureTrailingSlash(uploadPath.toUri().toString()));

        // Sibling fallbacks if server process was started from shoe-shop-admin or Shoe_Shop root
        Path adminUploads = Paths.get("../shoe-shop-admin/uploads").toAbsolutePath().normalize();
        locations.add(ensureTrailingSlash(adminUploads.toUri().toString()));
        locations.add(ensureTrailingSlash(adminUploads.resolve("products").normalize().toUri().toString()));

        Path backendUploads = Paths.get("../Shoe_Shop/uploads").toAbsolutePath().normalize();
        locations.add(ensureTrailingSlash(backendUploads.toUri().toString()));
        locations.add(ensureTrailingSlash(backendUploads.resolve("products").normalize().toUri().toString()));

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locations.toArray(new String[0]))
                .setCachePeriod(3600);
    }

    private String ensureTrailingSlash(String uri) {
        return uri.endsWith("/") ? uri : uri + "/";
    }
}
