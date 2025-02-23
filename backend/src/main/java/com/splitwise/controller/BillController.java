package com.splitwise.controller;

import com.splitwise.model.Bill;
import com.splitwise.service.BillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/bills")
@RequiredArgsConstructor
public class BillController {
    private final BillService billService;

    @PostMapping
    public ResponseEntity<Bill> createBill(
            @PathVariable Long groupId,
            @RequestParam(required = false) MultipartFile receipt,
            @RequestBody(required = false) BillRequest request) {
        if (receipt != null) {
            return ResponseEntity.ok(billService.processReceipt(groupId, receipt));
        } else {
            return ResponseEntity.ok(billService.createBill(groupId, request));
        }
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getGroupBills(@PathVariable Long groupId) {
        return ResponseEntity.ok(billService.getGroupBills(groupId));
    }
}

record BillRequest(Double total, List<Split> splits) {}
record Split(Long userId, Double amount) {}
