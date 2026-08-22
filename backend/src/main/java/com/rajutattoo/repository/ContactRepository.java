package com.rajutattoo.repository;

import com.rajutattoo.entity.ContactEnquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<ContactEnquiry, Long> {
    List<ContactEnquiry> findAllByOrderByCreatedAtDesc();
    List<ContactEnquiry> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    List<ContactEnquiry> findByEmailIgnoreCaseOrUserEmailIgnoreCaseOrderByCreatedAtDesc(String email, String userEmail);
}
