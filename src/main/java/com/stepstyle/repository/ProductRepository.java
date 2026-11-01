package com.stepstyle.repository;

import com.stepstyle.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Optional<Product> findByIdAndActiveTrue(Long id);

    Page<Product> findByCategoryIgnoreCaseAndActiveTrue(String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchPublicProducts(@Param("keyword") String keyword, Pageable pageable);


    long countByActiveTrue();

    long countByCategoryIgnoreCaseAndActiveTrue(String category);

    long countByStockQuantityLessThanAndActiveTrue(Integer threshold);

    @Query("SELECT COALESCE(SUM(p.stockQuantity), 0) FROM Product p WHERE " +
           "(LOWER(p.category) LIKE '%chappal%' OR LOWER(p.category) LIKE '%slipper%') AND p.active = true")
    Long sumChappalStock();

    @Query("SELECT COUNT(p) FROM Product p WHERE " +
           "(LOWER(p.category) LIKE '%chappal%' OR LOWER(p.category) LIKE '%slipper%') AND p.active = true")
    Long countChappalsAndSlippers();

    @Query("SELECT COUNT(p) FROM Product p WHERE LOWER(p.category) LIKE '%chappal%' AND p.active = true")
    Long countChappalProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE LOWER(p.category) LIKE '%slipper%' AND p.active = true")
    Long countSlipperProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE " +
           "(LOWER(p.category) LIKE '%shoe%' OR (LOWER(p.category) NOT LIKE '%chappal%' AND LOWER(p.category) NOT LIKE '%slipper%')) AND p.active = true")
    Long countShoeProducts();
}
