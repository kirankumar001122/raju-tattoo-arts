package com.rajutattoo.repository;

import com.rajutattoo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    java.util.List<User> findByRoleNotContainingIgnoreCase(String rolePattern);
}
