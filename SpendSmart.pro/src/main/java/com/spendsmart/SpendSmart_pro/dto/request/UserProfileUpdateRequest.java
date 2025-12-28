package com.spendsmart.SpendSmart_pro.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    private String firstname;

    @Size(max = 50)
    private String middlename;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    private String lastname;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "^[0-9+\\-() ]{0,20}$", message = "Invalid phone number format")
    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 100)
    private String street;

    @Size(max = 50)
    private String city;

    @Size(max = 50)
    private String state;

    @Size(max = 50)
    private String country;
}

