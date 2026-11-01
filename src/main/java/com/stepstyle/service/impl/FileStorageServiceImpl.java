package com.stepstyle.service.impl;

import com.stepstyle.exception.FileStorageException;
import com.stepstyle.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final Path fileStorageLocation;
    private final String uploadDir;

    // Supabase Storage configuration
    private final String supabaseUrl;
    private final String supabaseKey;
    private final String supabaseBucket;
    private final RestTemplate restTemplate = new RestTemplate();

    public FileStorageServiceImpl(
            @Value("${app.upload.dir:uploads/products}") String uploadDir,
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.key:}") String supabaseKey,
            @Value("${app.supabase.bucket:product-images}") String supabaseBucket) {
        this.uploadDir = uploadDir;
        this.supabaseUrl = (supabaseUrl != null && !supabaseUrl.isBlank()) ? supabaseUrl.replaceAll("/+$", "") : "";
        this.supabaseKey = (supabaseKey != null && !supabaseKey.isBlank()) ? supabaseKey.trim() : "";
        this.supabaseBucket = (supabaseBucket != null && !supabaseBucket.isBlank()) ? supabaseBucket.trim() : "product-images";

        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileStorageException("Could not create local upload directory: " + uploadDir, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Cannot store an empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileStorageException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new FileStorageException("Invalid file format. Only JPEG, PNG, WEBP, and GIF images are permitted");
        }

        String rawOriginalFilename = file.getOriginalFilename();
        if (rawOriginalFilename == null) {
            throw new FileStorageException("Original filename cannot be null");
        }

        String originalFilename = StringUtils.cleanPath(rawOriginalFilename);
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new FileStorageException("Filename contains invalid path sequence: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex >= 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new FileStorageException("Unsupported file extension: " + fileExtension);
        }

        String uniqueFileName = UUID.randomUUID() + fileExtension;

        // 1. Try Supabase Storage if configured
        if (!supabaseUrl.isEmpty() && !supabaseKey.isEmpty()) {
            try {
                String uploadEndpoint = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + uniqueFileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.set("apikey", supabaseKey);
                headers.setContentType(MediaType.parseMediaType(contentType));

                HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
                ResponseEntity<String> response = restTemplate.exchange(
                        uploadEndpoint,
                        HttpMethod.POST,
                        requestEntity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful()) {
                    String publicUrl = supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + uniqueFileName;
                    logger.info("Successfully uploaded image to Supabase Storage: {}", publicUrl);
                    return publicUrl;
                } else {
                    logger.warn("Supabase Storage responded with non-2xx: {}. Falling back to local storage.", response.getStatusCode());
                }
            } catch (Exception ex) {
                logger.warn("Supabase Storage upload failed ({}). Falling back to local storage.", ex.getMessage());
            }
        }

        // 2. Fallback to Local Filesystem
        try {
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName).normalize();
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                throw new FileStorageException("Security violation: Attempted path traversal outside upload directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            logger.info("Successfully uploaded file locally: {} -> {}", originalFilename, uniqueFileName);

            String normalizedDir = uploadDir.replace("\\", "/");
            if (!normalizedDir.startsWith("/")) {
                normalizedDir = "/" + normalizedDir;
            }
            if (!normalizedDir.endsWith("/")) {
                normalizedDir = normalizedDir + "/";
            }

            return normalizedDir + uniqueFileName;
        } catch (IOException ex) {
            throw new FileStorageException("Failed to store file " + uniqueFileName + ". Please try again!", ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return;
        }

        // Handle Supabase Storage deletion if relevant
        if (fileUrl.contains(supabaseBucket) && !supabaseUrl.isEmpty() && !supabaseKey.isEmpty()) {
            try {
                String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                String deleteEndpoint = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + fileName;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization", "Bearer " + supabaseKey);
                headers.set("apikey", supabaseKey);

                HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                restTemplate.exchange(deleteEndpoint, HttpMethod.DELETE, requestEntity, Void.class);
                logger.info("Deleted image from Supabase Storage: {}", fileName);
                return;
            } catch (Exception ex) {
                logger.warn("Could not delete from Supabase Storage: {}", ex.getMessage());
            }
        }

        // Local deletion
        try {
            int lastSlash = fileUrl.lastIndexOf("/");
            String filename = (lastSlash >= 0) ? fileUrl.substring(lastSlash + 1) : fileUrl;

            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return;
            }

            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            if (filePath.startsWith(this.fileStorageLocation)) {
                Files.deleteIfExists(filePath);
                logger.info("Deleted local product image: {}", filePath);
            }
        } catch (IOException ex) {
            logger.warn("Could not delete file at URL {}: {}", fileUrl, ex.getMessage());
        }
    }
}
