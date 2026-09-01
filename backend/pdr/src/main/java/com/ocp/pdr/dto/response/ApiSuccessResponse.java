package com.ocp.pdr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiSuccessResponse {

    private boolean success;
    private String message;
    private long resultCount;
    private long timestamp;
}
