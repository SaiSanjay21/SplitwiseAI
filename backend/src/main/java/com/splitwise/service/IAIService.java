package com.splitwise.service;

import com.splitwise.model.ExtractedItemDetail;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IAIService {
    public ExtractedItemDetail extractContentFromImage(MultipartFile imageFile) throws IOException;
}
