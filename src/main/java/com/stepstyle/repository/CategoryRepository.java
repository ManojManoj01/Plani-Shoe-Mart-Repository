package com.stepstyle.repository;

import com.stepstyle.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsBySlugIgnoreCase(String slug);
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    Optional<Category> findBySlugIgnoreCase(String slug);

    List<Category> findAllByOrderByDisplayOrderAsc();

    List<Category> findByActiveTrueOrderByDisplayOrderAsc();
}
