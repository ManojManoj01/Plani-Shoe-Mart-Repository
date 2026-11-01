package com.stepstyle.service;

import com.stepstyle.dto.UserSummaryDto;
import com.stepstyle.entity.User;
import com.stepstyle.security.UserPrincipal;

public interface UserService {

    UserSummaryDto getCurrentUser(UserPrincipal principal);

    User findUserById(Long id);

    User findUserByUsername(String username);
}
