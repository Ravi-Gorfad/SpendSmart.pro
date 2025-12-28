package com.spendsmart.SpendSmart_pro.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserProfileResponse {
    Long id;
    String username;
    String firstname;
    String middlename;
    String lastname;
    String email;
    String phoneNumber;
    String street;
    String city;
    String state;
    String country;
    Boolean emailVerified;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

