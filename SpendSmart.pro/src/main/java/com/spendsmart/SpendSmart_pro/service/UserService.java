package com.spendsmart.SpendSmart_pro.service;

import com.spendsmart.SpendSmart_pro.dto.request.UserProfileUpdateRequest;
import com.spendsmart.SpendSmart_pro.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getCurrentUserProfile();

    UserProfileResponse updateCurrentUserProfile(UserProfileUpdateRequest request);
}