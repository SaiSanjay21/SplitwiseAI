package com.splitwise.service;

import com.splitwise.controller.BillRequest;
import com.splitwise.controller.Split;
import com.splitwise.model.Bill;
import com.splitwise.model.BillSplit;
import com.splitwise.model.Group;
import com.splitwise.model.GroupMember;
import com.splitwise.repository.BillRepository;
import com.splitwise.repository.GroupRepository;
import com.theokanning.openai.OpenAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillService {
    private final BillRepository billRepository;
    private final GroupRepository groupRepository;
    private final GroupService groupService;
    private final OpenAiService openAiService;

    @Value("${openai.api-key}")
    private String openaiApiKey;

    @Transactional
    public Bill processReceipt(Long groupId, MultipartFile receiptFile) {
        try {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Group not found"));
            
            List<GroupMember> members = groupService.getGroupMembers(groupId);
            String base64Image = Base64.getEncoder().encodeToString(receiptFile.getBytes());
            
            // Process receipt with OpenAI (implementation needed)
            // This would call the OpenAI API to analyze the receipt
            // For now, we'll create a dummy bill
            Bill bill = new Bill();
            bill.setGroup(group);
            bill.setTotal(100.0); // Replace with actual total from OpenAI
            bill.setCreatedAt(LocalDateTime.now());
            bill.setReceiptUrl(base64Image);
            
            List<BillSplit> splits = new ArrayList<>();
            // Create equal splits for testing
            Double splitAmount = bill.getTotal() / members.size();
            for (GroupMember member : members) {
                BillSplit split = new BillSplit();
                split.setBill(bill);
                split.setUser(member.getUser());
                split.setAmount(splitAmount);
                splits.add(split);
            }
            bill.setSplits(splits);
            
            return billRepository.save(bill);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process receipt: " + e.getMessage());
        }
    }

    @Transactional
    public Bill createBill(Long groupId, BillRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Bill bill = new Bill();
        bill.setGroup(group);
        bill.setTotal(request.total());
        bill.setCreatedAt(LocalDateTime.now());

        List<BillSplit> splits = new ArrayList<>();
        for (Split split : request.splits()) {
            BillSplit billSplit = new BillSplit();
            billSplit.setBill(bill);
            billSplit.setUser(groupService.getUserById(split.userId()));
            billSplit.setAmount(split.amount());
            splits.add(billSplit);
        }
        bill.setSplits(splits);

        return billRepository.save(bill);
    }

    public List<Bill> getGroupBills(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return billRepository.findByGroup(group);
    }
}
