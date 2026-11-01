package com.stepstyle.repository;

import com.stepstyle.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findByEmailOrderByCreatedAtDesc(String email);
    List<ContactMessage> findByResolvedFalseOrderByCreatedAtDesc();
}
