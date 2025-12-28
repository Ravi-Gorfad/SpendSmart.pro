package com.spendsmart.SpendSmart_pro.service.impl;

import com.spendsmart.SpendSmart_pro.dto.request.UserProfileUpdateRequest;
import com.spendsmart.SpendSmart_pro.dto.response.UserProfileResponse;
import com.spendsmart.SpendSmart_pro.entity.User;
import com.spendsmart.SpendSmart_pro.exception.BadRequestException;
import com.spendsmart.SpendSmart_pro.exception.ResourceNotFoundException;
import com.spendsmart.SpendSmart_pro.repository.UserRepository;
import com.spendsmart.SpendSmart_pro.security.SecurityUtils;
import com.spendsmart.SpendSmart_pro.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        return mapToResponse(getCurrentUser());
    }

    @Override
    public UserProfileResponse updateCurrentUserProfile(UserProfileUpdateRequest request) {
        User user = getCurrentUser();

        // Update firstname if provided
        if (request.getFirstname() != null && !request.getFirstname().trim().isEmpty()) {
            user.setFirstname(request.getFirstname());
        }
        
        // Update middlename if provided (can be empty)
        user.setMiddlename(request.getMiddlename() != null && !request.getMiddlename().trim().isEmpty() 
                ? request.getMiddlename() : "");
        
        // Update lastname if provided
        if (request.getLastname() != null && !request.getLastname().trim().isEmpty()) {
            user.setLastname(request.getLastname());
        }
        
        // Update email if provided and check for duplicates
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            // Prevent duplicate email with other users
            userRepository.findByEmail(request.getEmail())
                    .filter(existing -> !Objects.equals(existing.getId(), user.getId()))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Another account already uses this email");
                    });
            user.setEmail(request.getEmail());
        }
        
        // Update optional fields (use empty string if null/empty to match entity constraints)
        user.setPhoneNumber(request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty() 
                ? request.getPhoneNumber() : "");
        user.setStreet(request.getStreet() != null && !request.getStreet().trim().isEmpty() 
                ? request.getStreet() : "");
        user.setCity(request.getCity() != null && !request.getCity().trim().isEmpty() 
                ? request.getCity() : "");
        user.setState(request.getState() != null && !request.getState().trim().isEmpty() 
                ? request.getState() : "");
        user.setCountry(request.getCountry() != null && !request.getCountry().trim().isEmpty() 
                ? request.getCountry() : "");

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    private User getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new BadRequestException("Unable to determine current user");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .middlename(user.getMiddlename())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .street(user.getStreet())
                .city(user.getCity())
                .state(user.getState())
                .country(user.getCountry())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
