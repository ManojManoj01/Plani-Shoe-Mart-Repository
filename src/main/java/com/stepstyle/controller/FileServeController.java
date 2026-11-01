package com.stepstyle.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/uploads")
@Tag(name = "Image Serving", description = "Public endpoint to serve uploaded product images")
public class FileServeController {

    private static final Logger logger = LoggerFactory.getLogger(FileServeController.class);

    private final String uploadDir;

    public FileServeController(@Value("${app.upload.dir:uploads/products}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @GetMapping("/**")
    @Operation(summary = "Serve uploaded image", description = "Serves uploaded product images from filesystem with proper Content-Type")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        String fullPath = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String relativePath = fullPath != null ? fullPath.replaceFirst("^/uploads/?", "") : "";

        if (relativePath.isBlank() || relativePath.contains("..")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Search in possible upload directories
        List<Path> searchCandidates = new ArrayList<>();

        Path configuredPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        searchCandidates.add(configuredPath.resolve(relativePath).normalize());
        if (configuredPath.getParent() != null) {
            searchCandidates.add(configuredPath.getParent().resolve(relativePath).normalize());
        }

        if (relativePath.startsWith("products/")) {
            String stripped = relativePath.substring("products/".length());
            searchCandidates.add(configuredPath.resolve(stripped).normalize());
        } else {
            searchCandidates.add(configuredPath.resolve("products").resolve(relativePath).normalize());
        }

        // Sibling directories fallback (running from shoe-shop-admin or Shoe_Shop root)
        Path adminUploads = Paths.get("../shoe-shop-admin/uploads").toAbsolutePath().normalize();
        searchCandidates.add(adminUploads.resolve(relativePath).normalize());
        if (relativePath.startsWith("products/")) {
            searchCandidates.add(adminUploads.resolve("products").resolve(relativePath.substring("products/".length())).normalize());
        } else {
            searchCandidates.add(adminUploads.resolve("products").resolve(relativePath).normalize());
        }

        Path backendUploads = Paths.get("../Shoe_Shop/uploads").toAbsolutePath().normalize();
        searchCandidates.add(backendUploads.resolve(relativePath).normalize());
        if (relativePath.startsWith("products/")) {
            searchCandidates.add(backendUploads.resolve("products").resolve(relativePath.substring("products/".length())).normalize());
        } else {
            searchCandidates.add(backendUploads.resolve("products").resolve(relativePath).normalize());
        }

        for (Path candidate : searchCandidates) {
            File file = candidate.toFile();
            if (file.exists() && file.isFile() && file.canRead()) {
                try {
                    String contentType = Files.probeContentType(candidate);
                    MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.IMAGE_JPEG;

                    return ResponseEntity.ok()
                            .contentType(mediaType)
                            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                            .body(new FileSystemResource(file));
                } catch (IOException e) {
                    logger.warn("Error probing content type for {}: {}", candidate, e.getMessage());
                    return ResponseEntity.ok()
                            .contentType(MediaType.IMAGE_JPEG)
                            .body(new FileSystemResource(file));
                }
            }
        }

        logger.warn("Uploaded image not found for path: {}", relativePath);
        return ResponseEntity.notFound().build();
    }
}
